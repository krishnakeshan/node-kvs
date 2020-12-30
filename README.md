# node-kvs
A single-process, thread-safe key-value store built with JavaScript for the Node.js runtime.

# Usage
## Require 'kvs'
The kvs module exports the KVS class as module.exports. Therefore, you can instantiate a key-value datastore directly as shown below. You can optionally pass in a file path as a string that points to a custom data store file from which you would like to read existing data and save new values to. If you do not pass in a file path, a default path of 'kvs-file' will be used.
```
const KVS = require('kvs')

const dataStore = new KVS('optional/path/to/custom/store/file');
```

## Initialize the datastore
Before you can use the datastore, you need to initialize it with the `init()` method. This performs the following actions in sequence:
1. Checks if the current datastore file (custom or default) is already in use by another process. Since this is explicitly disallowed, an error will be thrown if the current file cannot be used by this process. The process only further continues if the datastore file can be used.
2. Creates a lockfile that claims the current datastore file to be used by this process.
3. Reads in any data from the datastore file and loads it into the in-memory dictionary maintaining the key-value store.

## Limits
1. Keys cannot be greater than 32 characters in length.
2. Values cannot be greater than 16KB in size.
3. Size of the datastore file cannot exceed 1GB. This is evaluated asynchronously after every create operation.

## Closing the datastore
After you're done with the datastore, you must call `close()` on the datastore object to ensure a flush to the disk and releasing the lock on the current datastore file.

```
dataStore.close();
```

## Thread safety
All operations involving updating the in-memory datastore are synchronous and hence due to the nature of Node's execution mechanism, all operations should inherently be thread-safe. The only possible asynchronous operations are file updates after every 'create' but since they too will be sequential, there should be no special side effects.
