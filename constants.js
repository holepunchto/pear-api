'use strict'
const hypercoreid = require('hypercore-id-encoding')
const { platform, arch, isWindows, isLinux } = require('which-runtime')
const { fileURLToPath } = require('url-file-url')
const sodium = require('sodium-native')
const b4a = require('b4a')
const CHECKOUT = global.Pear?.constructor.RTI.checkout
const MOUNT = global.Pear?.constructor.RTI.mount
const BIN = 'by-arch/' + platform + '-' + arch + '/bin/'

let mount = MOUNT ? toURL(MOUNT + '/', 'file:') : null
if (!mount) {
  let url = require.main?.url
  if (url?.href.endsWith('/boot.bundle')) url.href += '/'
  else url = new URL('.', url)
  if (url && url.protocol === 'pear:') url = toURL(global.Pear.config.swapDir + '/', 'file:')
  mount = url
}

const LOCALDEV = CHECKOUT.length === null
const swapURL = mount.pathname.endsWith('.bundle/') ? new URL('..', mount) : mount
const swapPath = toPath(swapURL)
const IPC_ID = 'pear'
const PLATFORM_URL = LOCALDEV ? new URL('pear/', swapURL) : new URL('../../../', swapURL)

const PLATFORM_DIR = toPath(PLATFORM_URL)
const PLATFORM_LOCK = toPath(new URL('corestores/platform/db/LOCK', PLATFORM_URL))

const RUNTIME_EXEC = isWindows
  ? 'pear-runtime.exe'
  : 'pear-runtime'

const WAKEUP_EXEC = isWindows
  ? 'pear.exe'
  : isLinux
    ? 'pear'
    : 'Pear.app/Contents/MacOS/Pear'

const ALIASES = {
  pear: hypercoreid.decode(LOCALDEV ? 'dhpc5npmqkansx38uh18h3uwpdp6g9ukozrqyc4irbhwriedyeho' : CHECKOUT.key),
  keet: hypercoreid.decode('8kwmb7myncf56o8bpxfcgtwysgsukbydjef1zy86bye7msc4mooo'),
  runtime: hypercoreid.decode('jgt6kkwanq98x85d74xeaihxdmg8m95714kwc7g7ycdgirda6ojy'),
  doctor: hypercoreid.decode('ouenymy889n4ri9g74jm5bcr46wc6hqnxadqhfmbc4xbskerehby'),
  electron: hypercoreid.decode('yceb7sjhgfzsnza7oc38hy3oxu9dhnywi3mzxdm9ubc48kjnxqgo')
}

const EOLS = {
  keet: [hypercoreid.decode('jc38t9nr7fasay4nqfxwfaawywfd3y14krnsitj67ymoubiezqdy'), hypercoreid.decode('oeeoz3w6fjjt7bym3ndpa6hhicm8f8naxyk11z4iypeoupn6jzpo')]
}

exports.LOCALDEV = LOCALDEV
exports.CHECKOUT = CHECKOUT
exports.ALIASES = ALIASES
exports.EOLS = EOLS

exports.SWAP = swapPath
exports.PLATFORM_DIR = PLATFORM_DIR
exports.PLATFORM_LOCK = PLATFORM_LOCK
exports.PLATFORM_HYPERDB = toPath(new URL('db', PLATFORM_URL))
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

function toURL (s) {
  if (s[1] === ':' && s[0] !== '/') return new URL('file:' + s)
  if (s.startsWith('file:')) return new URL(s)
  return new URL(s, 'file:')
}

function pipeId (s) {
  const buf = b4a.allocUnsafe(32)
  sodium.crypto_generichash(buf, b4a.from(s))
  return b4a.toString(buf, 'hex')
}
