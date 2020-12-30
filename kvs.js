const fs = require('fs');

const VALUE_SIZE_LIMIT = 16000;
const FILE_SIZE_LIMIT = 1000000000;

module.exports = class KVS {
    constructor(filePath = 'kvs-file') {
        this.dataStore = {};
        this.filePath = filePath;
    }

    async init() {
        // read data from file
        let data = fs.readFileSync(this.filePath, {
            encoding: 'utf-8'
        });
        let lines = data.split('\n').slice(0, -1);
        for (let line of lines) {
            let json = JSON.parse(line);
            this.dataStore[json[0]] = json[1];
        }
    }

    async create(key, value, ttl = -1) {
        if (key.length > 32)
            throw new Error('key size exceeds 32 characters');
        if (this.dataStore.hasOwnProperty(key))
            throw new Error(`key-value pair already exists with key ${key}`);

        const jsonString = JSON.stringify([key, value]) + '\n';
        const valueSize = jsonString.length - key.length - 4; // subtract 4 for characters '[', ']', ',', '\n'
        if (valueSize > VALUE_SIZE_LIMIT)
            throw new Error('value size exceeds 16KB');

        this.dataStore[key] = value;

        // set timeout
        if (ttl != -1)
            setTimeout((delKey) => {
                this.del(delKey);
            }, ttl * 1000, key);

        // write changes to disk
        fs.appendFile(this.filePath, jsonString, (err) => {
            if (err) throw err;

            // check if file exceeded size limit
            fs.stat(store.filePath, (err, stats) => {
                if (err) throw err;

                if (stats.size > FILE_SIZE_LIMIT)
                    throw new Error('datastore file size limit exceeded');
            })
        });
    }

    read(key) {
        if (!key.hasOwnProperty(key))
            throw new Error(`key ${key} does not exist`);
        return this.dataStore[key];
    }

    del(key) {
        // reject if non-existent key passed
        if (!this.dataStore.hasOwnProperty(key))
            throw new Error(`key ${key} does not exist`);

        // update in-memory dataStore
        delete this.dataStore[key];
    }

    close() {
        // copy all but 'key' entry to new file
        let tempFileName = this.filePath + '-temp';
        var wrote = 0;
        const entries = Object.entries(this.dataStore);
        for (var i = 0; i < entries.length; i++) {
            fs.appendFile(tempFileName, JSON.stringify(entries[i]) + '\n', (err) => {
                if (err) throw err;

                wrote++;

                if (wrote === entries.length) {
                    // delete old file
                    fs.unlink(this.filePath, (err) => {
                        if (err) throw err;

                        // rename this file
                        fs.rename(tempFileName, this.filePath, (err) => {
                            if (err) throw err;
                            console.log('renamed');
                        });
                    });
                }
            });
        }
    }
}