'use strict'
const hypercoreid = require('hypercore-id-encoding')
const { platform, arch, isWindows, isLinux } = require('which-runtime')
const { fileURLToPath } = require('url-file-url')
const sodium = require('sodium-native')
const b4a = require('b4a')
const CHECKOUT = global.Pear?.constructor.CHECKOUT
const MOUNT = global.Pear?.constructor.MOUNT
const BIN = 'by-arch/' + platform + '-' + arch + '/bin/'

let mount = MOUNT ? new URL(MOUNT + '/') : null
if (!mount) {
  let url = require.main?.url
  if (url?.href.endsWith('/boot.bundle')) url.href += '/'
  else url = new URL('.', url)
  if (url && url.protocol === 'pear:' && url.host === 'dev') url = new URL(global.Pear.config.swapDir + '/', 'file:')
  mount = url
}

const LOCALDEV = CHECKOUT.length === null
const swapURL = mount.pathname.endsWith('.bundle/') ? new URL('..', mount) : mount
const swapPath = toPath(swapURL)
const IPC_ID = 'pear'
const PLATFORM_URL = LOCALDEV ? new URL('pear/', swapURL) : new URL('../../../', swapURL)

const PLATFORM_DIR = toPath(PLATFORM_URL)
const PLATFORM_LOCK = toPath(new URL('corestores/platform/primary-key', PLATFORM_URL))

const RUNTIME_EXEC = isWindows
  ? 'pear-runtime.exe'
  : 'pear-runtime'

const WAKEUP_EXEC = isWindows
  ? 'pear.exe'
  : isLinux
    ? 'pear'
    : 'Pear.app/Contents/MacOS/Pear'

const ALIASES = {
  keet: hypercoreid.decode('oeeoz3w6fjjt7bym3ndpa6hhicm8f8naxyk11z4iypeoupn6jzpo'),
  runtime: hypercoreid.decode('nkw138nybdx6mtf98z497czxogzwje5yzu585c66ofba854gw3ro'),
  doctor: hypercoreid.decode('3ih5k1t15xb9hrnz1mkd4jhamefis7ni4nwuus8f1w3j94yu831y')
}

const EOLS = {
  keet: hypercoreid.decode('jc38t9nr7fasay4nqfxwfaawywfd3y14krnsitj67ymoubiezqdy')
}

exports.LOCALDEV = LOCALDEV
exports.CHECKOUT = CHECKOUT
exports.ALIASES = ALIASES
exports.EOLS = EOLS

exports.SWAP = swapPath
exports.PLATFORM_DIR = PLATFORM_DIR
exports.PLATFORM_LOCK = PLATFORM_LOCK
exports.PLATFORM_HYPERDB = toPath(new URL('hyperdb', PLATFORM_URL))
exports.GC = toPath(new URL('gc', PLATFORM_URL))
exports.PLATFORM_CORESTORE = toPath(new URL('corestores/platform', PLATFORM_URL))
exports.UPGRADE_LOCK = toPath(new URL('lock', PLATFORM_URL))
exports.APPLINGS_PATH = toPath(new URL('applings', PLATFORM_URL))
exports.MOUNT = mount.href.slice(0, -1)
exports.SOCKET_PATH = isWindows ? `\\\\.\\pipe\\${IPC_ID}-${pipeId(PLATFORM_DIR)}` : `${PLATFORM_DIR}/${IPC_ID}.sock`
exports.BOOT = require.main?.filename

exports.CONNECT_TIMEOUT = 20_000
exports.IDLE_TIMEOUT = 30_000
exports.SPINDOWN_TIMEOUT = 60_000

exports.WAKEUP = toPath(new URL(BIN + WAKEUP_EXEC, swapURL))
exports.RUNTIME = toPath(new URL(BIN + RUNTIME_EXEC, swapURL))

exports.SALT = b4a.from('d134aa8b0631f1193b5031b356d82dbea214389208fa4a0bcdf5c2e062d8ced2', 'hex')

exports.KNOWN_NODES_LIMIT = 100

function toPath (u) {
  return fileURLToPath(u).replace(/[/\\]$/, '') || '/'
}

function pipeId (s) {
  const buf = b4a.allocUnsafe(32)
  sodium.crypto_generichash(buf, b4a.from(s))
  return b4a.toString(buf, 'hex')
}
