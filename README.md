# pear-api

> Pear API Base & Integration Module

**Status: WIP**

## `pear-api`

Supplies the API base for the Pear API (https://docs.pears.com/pear-runtime/api).

Typically for extending from for user-interface-runtime purposes:

```js
const Worker = require('pear-api/worker')

class API extends require('pear-api') {
  constructor (ipc, state, { worker, teardown } = {}) {
    super(ipc, state, { worker, teardown })
    this[this.constructor.ui] = new UIAPI()
  }
}
const worker = new Worker()
global.Pear = new API(ipc, state, { worker })
```

This creates the usual `global.Pear` API with the interface-runtime-specific `UIAPI` stored on a symbolic reference so it can later be exported from interface module entrypoint. The `global.Pear.worker` API can also be customized by extending `pear-api/worker` and passing an instance of the extended worker to `API`.

## Statics

### `API.ui` `<Symbol>`

Interface integration generally leads to the need for state setup in pre-init (e.g. preload). At the same time there can be a need to override parts of the API anyway, so during API initialization is the first place to hookup UI APIs. The `API.ui` symbol can be used for integration purposes to store ui state or API for later public exposure, e.g. `module.exports = Pear[Pear.constructor.ui]`.

## Integration Libraries

The `pear-api` module also exposes libraries that provide platform core functionality.

### `pear-api/constants`

Platform constants.

### `pear-api/gunk`

Platform gunk - glue-state for native and protocol integration.

### `pear-api/crasher`

Sets up crash handlers and outputs crash logs to a known location on-disk.

### `pear-api/tryboot`

Attempt to boot the sidecar. Useful when establishing a `pear-ipc` connection from an interface-runtime to Pear Sidecar, pass it as the `connect` option.

### `pear-api/worker`

The class for the `Pear.worker` API. Extend this class, create a worker instance and pass it to as an option to `pear-api` `API` class to override methods as needed for a given interface-runtime.

### `pear-api/teardown`

The `Pear.teardown` function.

### `pear-api/cmd-def/pear`

Paparam definition array for the `pear` command. Useful for parsing platform flags passed to an interface-runtime.

### `pear-api/cmd-def/run`

Paparam definition array for the `pear run` command. Useful for parsing run flags passed to an interface-runtime.

### `pear-api/shell`

Parse out platform flags while ignoring the rest of the command. Useful for parsing platform flags regardless of whether the flags after `<cmd>` are valid.
 
# LICENSE

Apache 2.0
