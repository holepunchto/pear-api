'use strict'
const { isWindows } = require('which-runtime')
const os = require('os')
const path = require('path')
const { pathToFileURL } = require('url-file-url')
const hypercoreid = require('hypercore-id-encoding')
const pearLink = require('pear-link')
const crypto = require('hypercore-crypto')
const { PLATFORM_DIR, SWAP, RUNTIME } = require('./constants')
const process = require('process')
const CWD = process.cwd()
const ENV = process.env
const parseLink = require('./parse-link')
const { ERR_INVALID_APP_STORAGE } = require('./errors')

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
  entrypoint = null
  applink = null
  dht = null
  route = null
  routes = null
  unrouted = null
  via = null

  static route (pathname, routes, unrouted) {
    if (!routes) return pathname
    if (unrouted.some((unroute) => pathname.startsWith(unroute))) return pathname
    let route = typeof routes === 'string' ? routes : (routes[pathname] ?? pathname)
    if (route[0] === '.') route = route.length === 1 ? '/' : route.slice(1)
    return route
  }

  static storageFromLink (link) {
    const parsedLink = typeof link === 'string' ? parseLink(link) : link
    const appStorage = path.join(PLATFORM_DIR, 'app-storage')
    return parsedLink.protocol !== 'pear:'
      ? path.join(appStorage, 'by-random', crypto.randomBytes(16).toString('hex'))
      : path.join(appStorage, 'by-dkey', crypto.discoveryKey(hypercoreid.decode(parsedLink.drive.key)).toString('hex'))
  }

  static configFrom (state) {
    const { id, startId, key, links, alias, env, gui, options, checkpoint, checkout, flags, dev, stage, storage, name, main, args, channel, release, applink, fragment, link, linkData, entrypoint, route, routes, dir, dht } = state
    const pearDir = PLATFORM_DIR
    const swapDir = SWAP
    return { id, startId, key, links, alias, env, gui, options, checkpoint, checkout, flags, dev, stage, storage, name, main, args, channel, release, applink, fragment, link, linkData, entrypoint, route, routes, dir, dht, pearDir, swapDir }
  }

  update (state) {
    Object.assign(this, state)
    this.#onupdate()
  }

  constructor (params = {}) {
    const { dht, link, startId = null, id = null, args = null, env = ENV, cwd = CWD, dir = cwd, cmdArgs, onupdate = () => {}, flags, run, storage = null } = params
    const {
      appling, channel, devtools, checkout, links = '',
      dev = false, stage, updates, updatesDiff, followSymlinks,
      unsafeClearAppStorage, chromeWebrtcInternals
    } = flags
    const { drive: { alias = null, key = null }, pathname: route = '', protocol, hash } = link ? parseLink(link) : { drive: {} }
    const pathname = protocol === 'file:' ? (isWindows ? route.slice(1).slice(dir.length) : route.slice(dir.length)) : route
    const store = flags.tmpStore ? path.join(os.tmpdir(), crypto.randomBytes(16).toString('hex')) : flags.store
    this.#onupdate = onupdate
    this.startId = startId
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
    this.fragment = hash ? hash.slice(1) : null
    this.linkData = pathname?.startsWith('/') ? pathname.slice(1) : pathname
    this.key = key
    this.link = link ? (link.startsWith(protocol) ? link : pearLink.normalize(pathToFileURL(link).toString())) : null
    this.applink = key ? this.link.slice(0, -(~~(pathname?.length) + ~~(hash?.length))) : pathToFileURL(this.dir).href
    this.alias = alias
    this.cmdArgs = cmdArgs
    this.id = id
    this.followSymlinks = followSymlinks
    this.rti = flags.rti ? JSON.parse(flags.rti) : null // important to know if this throws, so no try/catch
    this.clearAppStorage = unsafeClearAppStorage
    this.chromeWebrtcInternals = chromeWebrtcInternals
    this.env = { ...env }
    if (this.stage || (this.run && this.dev === false)) {
      this.env.NODE_ENV = this.env.NODE_ENV || 'production'
    }
    this.links = links.split(',').reduce((links, kv) => {
      const [key, value] = kv.split('=')
      links[key] = value
      return links
    }, {})
    this.storage = this.store ? (path.isAbsolute(this.store) ? this.store : path.resolve(this.cwd, this.store)) : this.storage
    const invalidStorage = this.key === null && this.storage !== null &&
      this.storage.startsWith(this.dir) && this.storage.includes(path.sep + 'pear' + path.sep + 'pear' + path.sep) === false
    if (invalidStorage) throw ERR_INVALID_APP_STORAGE('Application Storage may not be inside the project directory. --store "' + this.storage + '" is invalid')
  }
}
