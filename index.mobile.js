const SystemLog = require('bare-system-logger')
const Console = require('bare-console')
global.console = new Console(new SystemLog())
const crypto = require('bare-crypto')
const plink = require('pear-link')
const os = require('bare-os')
const goodbye = require('graceful-goodbye')

const { data, info, args } = Bare.Thread.self.data
const { link, pkgContent } = info

let pkg = {}
if (pkgContent) pkg = pkgContent ?? JSON.parse(pkgContent)
console.log('logging pkg:', pkg)

const main = pkg.main ?? link.lastIndexOf('/') + 1
const options = pkg.pear ?? null
const name = pkg.name ?? link.lastIndexOf('/') + 1

const assets = null // TODO: support assets
Bare.Thread.self.data = data

class API {
  constructor(opts = {}) {
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
    try {
      console.log('parsing link:', link)
      const { hash, drive, query } = plink.parse(link)
      const { key, fork, release, length } = drive
      const linkInfo = { key, fork, release, length, fragement: hash, query }
      this.app = { ...this.app, ...linkInfo } // same as on desktop (its the key of the current thread (on desktop process))
      console.log('logging app:', this.app)
    } catch (err) {
      console.log('error with pear-link:', err)
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

  checkpoint(state) {
    global.Pear.app.checkpoint = state
    // return ref.track(this.#ipc.checkpoint(state)) // TODO: find equivalent
  }

  versions() {
    return { runtimes: { bare: Bare.versions.bare }, engines: {} }
  }

  exit() {
    return os.kill(Bare.pid, 'SIGTERM')
  }

  teardown(callback, position) {
    return goodbye(callback, position)
  }
}

// eg:
//       env,
//       gui,
//       assets,
//       options,
//       checkpoint,
//       checkout,
//       flags,
//       dev,
//       stage,
//       storage,
//       name,
//       main,
//       args,
//       channel,
//       release,
//       applink,
//       query,
//       fragment,
//       link,
//       linkData,
//       entrypoint,
//       route,
//       routes,
//       dir,
//       dht,
//       prerunning,
//       version

global.Pear = new API({ main, options, name, args })

module.exports = API
