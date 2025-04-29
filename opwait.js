'use strict'
const noop = () => {}
module.exports = function opwait (stream, onstatus) {
  if (typeof onstatus !== 'function') onstatus = noop
  return new Promise((resolve, reject) => {
    let final = null
    stream.once('error', reject)
    stream.on('end', () => { resolve(final) })
    stream.on('data', (status) => {
      const { tag, data } = status
      if (tag === 'final') final = data
      try {
        const p = onstatus(status)
        if (typeof p?.catch === 'function') p.catch((err) => stream.destroy(err))
      } catch (err) {
        stream.destroy(err)
      }
    })
  })
}
