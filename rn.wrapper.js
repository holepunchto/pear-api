const SystemLog = require('bare-system-logger')
const Console = require('bare-console')
global.console = new Console(new SystemLog())
const Module = require('bare-module')
const { startsWithWindowsDriveLetter } = require('bare-module-resolve')
const path = require('bare-path')
const fs = require('bare-fs')
const crypto = require('bare-crypto')
const { fileURLToPath, pathToFileURL } = require('bare-url')
const plink = require('pear-link')
const os = require('bare-os')
const goodbye = require('graceful-goodbye')

let bundle = Bare.argv.pop()
const info = Bare.argv.pop()
const { filename, link, pkgContent } = JSON.parse(info)
const pkg = pkgContent ?? JSON.parse(pkgContent)
const { main, pear: options, name } = pkg
const assets = null // TODO: support assets

class API {
  constructor (opts = {}){
    this.isMobile = true
    this.args = opts.args || Bare.argv
    this.argv = null // TODO (maybe the other args (the ones we poped))
    this.pid = Bare.pid
    this.exitCode = Bare.exitCode

    this.app = {} // need to adjust

    this.app.startId = crypto.randomBytes(16).toString('hex') // ID for the thread
    this.app.key = null
    this.app.fork = null
    this.app.release = null
    try{
      const { hash, drive, query } = plink.parse(link)
      const { key, fork, release, length } = drive
      const linkInfo = { key, fork, release, length, fragement:hash, query}
      this.app = { ...this.app, ...linkInfo } // same as on desktop (its the key of the current thread (on desktop process))
    } catch (err) {
      console.warn('error with pear-link:', err)
    }
    this.app = {
        ...this.app,
        link, // will be link key for links-map
        links: {}, // TODO: find out what links is
        alias: undefined, // TODO: add alias
        main: opts.main || null,
        dev: undefined, // TODO (boolean) -> check if its simulator
        channel: undefined, // TODO (string: stage channel (not just for local, also for remote worker))
        dht: undefined, // TODO (object {nodes: Array} (DHT nodes))
        dir: undefined, // TODO (directory of root process (do we need that??))
        decal: undefined, // TODO (boolean (what is it???))
        entrypoint: undefined, // TODO (string (entrypoint of the worker))
        flags: undefined, // maybe in the future (passing flags to the worklet start)
        linkData: undefined, // TODO (string (what is it??))
        name: opts.name || null,
        options: opts.options || null, // TODO (object (pear field as defined in package.json))
        route: undefined, // TODO (string (what is it??))
        routes: opts.options?.routes || null,
        storage: undefined, // User should define (eg expo file system)
        swapDir: undefined, // seems to point to dir where pear executable is in... do we need it???
        version: undefined, // TODO (what is it??)
        stage: undefined, // TODO (what is it??)
        gui: undefined // do we need that?
    }

    this.config = this.app
  }

  checkpoint (state) {
    global.Pear.app.checkpoint = state
    // return ref.track(this.#ipc.checkpoint(state)) // TODO: find equivalent
  }

  versions () {
    return { runtimes: { bare: Bare.versions.bare }, engines: {}}
  }

  exit () {
    return os.kill(Bare.pid, 'SIGTERM')
  }

  teardown (callback, position){
    return goodbye(callback, position)
  }
}

global.Pear = new API({main, options, name})
load()

async function load() {
  if (assets !== null) {
    let url

    if (startsWithWindowsDriveLetter(assets)) {
      url = null
    } else {
      url = URL.parse(assets)
    }

    if (url === null) url = pathToFileURL(assets)

    assets = fileURLToPath(url)
  }

  let url

  if (startsWithWindowsDriveLetter(filename)) {
    url = null
  } else {
    url = URL.parse(filename)
  }

  if (url === null) url = pathToFileURL(filename)

  if (bundle === null) bundle = Module.protocol.read(url)
  else bundle = Buffer.from(bundle)

  if (assets !== null && path.extname(url.href) === '.bundle') {
    const bundle = Bundle.from(bundle)

    if (bundle.id !== null && bundle.assets.length > 0) {
      const id = crypto.createHash('blake2b256').update(bundle.id).digest('hex')

      const root = path.join(assets, id)

      const tmp = fs.existsSync(root) ? null : path.join(assets, 'tmp')

      if (tmp !== null) {
        fs.rmSync(tmp, { recursive: true, force: true })
        fs.mkdirSync(tmp, { recursive: true })
      }

      bundle = await unpack(bundle, { files: false, assets: true }, (key) => {
        if (tmp !== null) {
          const target = path.join(tmp, key)

          fs.mkdirSync(path.dirname(target), { recursive: true })
          fs.writeFileSync(target, bundle.read(key))
        }

        return pathToFileURL(path.join(root, key)).href
      })

      if (tmp !== null) fs.renameSync(tmp, root)
    }
  }

  // local cache doesnt work with ESM (as of now)
  // const cache = Object.create(null) // use clean cache to avoid id collisions

  Module.load(url, bundle)
}
