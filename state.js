'use strict'
const { isBare, isWindows } = require('which-runtime')
const os = isBare ? require('bare-os') : require('os')
const fs = isBare ? require('bare-fs') : require('fs')
const path = isBare ? require('bare-path') : require('path')
const { pathToFileURL } = require('url-file-url')
const hypercoreid = require('hypercore-id-encoding')
const z32 = require('z32')
const crypto = require('hypercore-crypto')
const { PLATFORM_DIR, SWAP, RUNTIME } = require('pear-api/constants')
const CWD = isBare ? os.cwd() : process.cwd()
const ENV = isBare ? require('bare-env') : process.env
const parseLink = require('./parse-link')
const { ERR_INVALID_APP_NAME, ERR_INVALID_APP_STORAGE } = require('./errors')
const readPkg = (pkgPath) => {
  let pkg = null
  try { pkg = fs.readFileSync(path.resolve(pkgPath)) } catch { /* ignore */ }
  if (pkg) pkg = JSON.parse(pkg) // important to know if this throws, so no try/catch
  return pkg
}

module.exports = class State {
  env = null
  channel = null
  args = null
  checkpoint = null
  #onupdate = null
  runtime = RUNTIME
  reloadingSince = 0
  type = null
  error = null
  entrypoints = null
  applink = null
  dht = null
  ui = null
  route = null
  routes = null
  unrouted = null
  entrypoint = null
  static injestPackage (state, pkg, overrides = {}) {
    state.manifest = pkg
    state.main = pkg?.main || 'index.html'
    state.options = pkg?.pear || null
    state.name = pkg?.pear?.name || pkg?.name || null
    state.links = pkg?.pear?.links || null
    state.gui = pkg?.pear?.gui || null
    if (overrides.links) {
      const links = overrides.links.split(',').reduce((links, kv) => {
        const [key, value] = kv.split('=')
        links[key] = value
        return links
      }, {})
      state.links = { ...(state.links || {}), ...links }
    }
    state.dependencies = [
      ...(pkg?.dependencies ? Object.keys(pkg.dependencies) : []),
      ...(pkg?.devDependencies ? Object.keys(pkg.devDependencies) : []),
      ...(pkg?.peerDependencies ? Object.keys(pkg.peerDependencies) : []),
      ...(pkg?.optionalDependencies ? Object.keys(pkg.optionalDependencies) : []),
      ...(pkg?.bundleDependencies || []),
      ...(pkg?.bundledDependencies || [])
    ]
    state.entrypoints = new Set(pkg?.pear?.stage?.entrypoints || [])
    state.routes = pkg?.pear?.routes || null
    state.route = '/' + state.linkData
    const unrouted = new Set(Array.isArray(pkg?.pear?.unrouted) ? pkg?.pear?.unrouted : [])
    unrouted.add('/node_modules/.bin/')
    state.unrouted = Array.from(unrouted)
    let entrypoint = this.route(state.route, state.routes, state.unrouted)
    if (this.isEntrypoint(entrypoint) === false) return
    if (entrypoint.startsWith('/') === false) entrypoint = '/' + entrypoint
    else if (entrypoint.startsWith('./')) entrypoint = entrypoint.slice(1)
    state.entrypoint = entrypoint
  }

  static route (pathname, routes, unrouted) {
    if (!routes) return pathname
    if (unrouted.some((unroute) => pathname.startsWith(unroute))) return pathname
    if (typeof routes === 'string') return routes
    return routes[pathname] || routes[pathname.slice(1)] || pathname
  }

  static storageFromLink (link) {
    const parsedLink = typeof link === 'string' ? parseLink(link) : link
    const appStorage = path.join(PLATFORM_DIR, 'app-storage')
    return parsedLink.protocol !== 'pear:'
      ? path.join(appStorage, 'by-random', crypto.randomBytes(16).toString('hex'))
      : path.join(appStorage, 'by-dkey', crypto.discoveryKey(hypercoreid.decode(parsedLink.drive.key)).toString('hex'))
  }

  static configFrom (state) {
    const { id, startId, key, links, alias, env, gui, options, checkpoint, checkout, flags, dev, tier, stage, storage, name, main, dependencies, args, channel, release, applink, fragment, link, linkData, entrypoint, route, routes, dir, dht } = state
    const pearDir = PLATFORM_DIR
    const swapDir = SWAP
    return { id, startId, key, links, alias, env, gui, options, checkpoint, checkout, flags, dev, tier, stage, storage, name, main, dependencies, args, channel, release, applink, fragment, link, linkData, entrypoint, route, routes, dir, dht, pearDir, swapDir }
  }

  static isKeetInvite (segment) {
    if (!segment || segment.length < 100) return false
    try { z32.decode(segment) } catch { return false }
    return true
  }

  static isEntrypoint (pathname) {
    if (pathname === null || pathname === '/') return false
    // NOTE: return true once keet invite code detection is no longer needed, assess for removal October 2024
    const segment = pathname = pathname?.startsWith('/') ? pathname.slice(1) : pathname
    return this.isKeetInvite(segment) === false
  }

  update (state) {
    Object.assign(this, state)
    this.#onupdate()
  }

  constructor (params = {}) {
    const { dht, link, id = null, args = null, env = ENV, cwd = CWD, dir = cwd, cmdArgs, onupdate = () => {}, flags, run, storage = null } = params
    const {
      startId, appling, channel, devtools, checkout, links,
      dev = false, stage, updates, updatesDiff, followSymlinks,
      unsafeClearAppStorage, chromeWebrtcInternals
    } = flags
    const { drive: { alias = null, key = null }, pathname: route, protocol, hash } = link ? parseLink(link) : { drive: {} }
    const pathname = protocol === 'file:' ? (isWindows ? route.slice(1).slice(dir.length) : route.slice(dir.length)) : route
    const segment = pathname?.startsWith('/') ? pathname.slice(1) : pathname
    const fragment = hash ? hash.slice(1) : (this.constructor.isKeetInvite(segment) ? segment : null)
    const pkgPath = path.join(dir, 'package.json')
    const pkg = key === null ? readPkg(pkgPath) : null
    const store = flags.tmpStore ? path.join(os.tmpdir(), crypto.randomBytes(16).toString('hex')) : flags.store
    this.#onupdate = onupdate
    this.startId = startId || null
    this.dht = dht
    this.store = store
    this.args = args
    this.appling = appling
    this.channel = channel || null
    this.checkout = checkout
    this.dir = dir
    this.cwd = cwd
    this.run = run ?? flags.run
    this.storage = storage
    this.flags = flags
    this.dev = dev
    this.devtools = this.dev || devtools
    this.updatesDiff = this.dev || updatesDiff
    this.updates = updates
    this.stage = stage
    this.fragment = fragment
    this.linkData = segment
    this.link = link ? (link.startsWith(protocol) ? link : pathToFileURL(link).toString()) : null
    this.key = key
    this.applink = key ? this.link.slice(0, -(~~(pathname?.length) + ~~(hash?.length))) : null
    this.alias = alias
    this.manifest = pkg
    this.cmdArgs = cmdArgs
    this.pkgPath = pkgPath
    this.id = id
    this.followSymlinks = followSymlinks
    this.rti = flags.rti ? JSON.parse(flags.rti) : null // important to know if this throws, so no try/catch
    this.clearAppStorage = unsafeClearAppStorage
    this.chromeWebrtcInternals = chromeWebrtcInternals
    this.env = { ...env }
    if (this.stage || (this.run && this.dev === false)) {
      this.env.NODE_ENV = this.env.NODE_ENV || 'production'
    }
    this.constructor.injestPackage(this, pkg, { links })
    const invalidStorage = this.key === null && this.storage !== null && this.storage.startsWith(this.dir) && this.storage.includes('/pear/pear/') === false
    if (invalidStorage) throw ERR_INVALID_APP_STORAGE('Application Storage may not be inside the project directory. --store "' + this.storage + '" is invalid')
    const invalidName = /^[@/a-z0-9-_]+$/.test(this.name) === false
    if (invalidName) throw ERR_INVALID_APP_NAME('The package.json name / pear.name field must be lowercase and one word, and may contain letters, numbers, hyphens (-), underscores (_), forward slashes (/) and asperands (@).')
  }
}
