const SystemLog = require('bare-system-logger')
const Console = require('bare-console')
global.console = new Console(new SystemLog())
const Module = require('bare-module')
const { startsWithWindowsDriveLetter } = require('bare-module-resolve')
const path = require('bare-path')
const fs = require('bare-fs')
const crypto = require('bare-crypto')
const { fileURLToPath, pathToFileURL } = require('bare-url')

let bundle = Bare.argv.pop()
const filename = Bare.argv.pop()
const assets = null // TODO: support assets

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
  console.log(url)
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

  const cache = Object.create(null) // use clean cache to avoid id collisions

  Module.load(url, bundle, {cache})
}


const goodbye = require('graceful-goodbye')

global.Pear = {}
global.Pear.test = "test"
global.Pear.isMobile = true

console.log('logging bare api', Bare)
global.Pear.versions = () => { return { runtimes: { bare: Bare.versions.bare }, engines: {}}}
global.Pear.exit = (code) => Bare.exit(code)
global.Pear.argv = Bare.argv
global.Pear.pid = Bare.pid
global.Pear.exitCode = Bare.exitCode
global.Pear.teardown = goodbye
global.Pear.checkpoint = null // 
global.Pear.app = null // need stage create config from im pear-state

// eg:
//       id,
//       startId,
//       key,
//       links,
//       alias,
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
