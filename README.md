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
    this[this.constructor.UI] = new UIAPI()
  }
}
const worker = new Worker()
global.Pear = new API(ipc, state, { worker })
```

This creates the usual `global.Pear` API with the interface-runtime-specific `UIAPI` stored on a symbolic reference so it can later be exported from interface module entrypoint. The `global.Pear.worker` API can also be customized by extending `pear-api/worker` and passing an instance of the extended worker to `API`.

## Integration Libraries

The `pear-api` module also exposes libraries that provide platform core functionality.

### `pear-api/constants`

Platform constants.

### `pear-api/gunk`

Platform gunk - glue-state for native and protocol integration.

### `pear-api/state`

Base `State` class for cross-process state management.

### `pear-api/errors`

Platform error types. Includes `known` method for checking if error is recognized.

### `pear-api/crasher`

Sets up crash handlers and outputs crash logs to a known location on-disk.

### `pear-api/tryboot`

Attempt to boot the sidecar. Useful when establishing a `pear-ipc` connection from an interface-runtime to Pear Sidecar, pass it as the `connect` option.

### `pear-api/worker`

Internal class, pass this (or a subclass of it) to the `pear-api` `API` constructor for `Pear.run` to use.

### `pear-api/parse-link`

Parse `pear://` links per [`pear-link`](https://github.com/holepunchto/pear-link).

### `pear-api/teardown`

The `Pear.teardown` function.

### `pear-api/transform`

A minimal transformer for `__LOCALVAR__`-style templates.

### `pear-api/terminal`

Terminal interface.

### `pear-api/cmd`

Parse out platform flags while ignoring the rest of the command. Useful for parsing platform flags regardless of whether the flags after `<cmd>` are valid. 

### `pear-api/cmd/pear`

Paparam definition array for the `pear` command. Useful for parsing platform flags passed to an interface-runtime.

### `pear-api/cmd/run`

Paparam definition array for the `pear run` command. Useful for parsing run flags passed to an interface-runtime.

 
# LICENSE

Apache 2.0
