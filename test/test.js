var assert = require('assert');
var KVS = require('../kvs');

let dataStore = new KVS();
dataStore.init();

describe('KeyValue Store', function () {
    describe('#create()', function () {
        it('should create an entry with given key and value (without ttl)', function () {
            let testKey = 'testKey1';
            let testValue = {
                'testField': 'testValue',
            };
            dataStore.create(testKey, testValue);
            assert.strictEqual(dataStore.read(testKey), testValue);
        });

        it('should create an entry with ttl of 3 seconds', function () {
            let testKey = 'testKey2';
            let testValue = {
                'testField': 'testValue',
            };
            let ttl = 0.5;
            dataStore.create(testKey, testValue, ttl);
            assert.strictEqual(dataStore.read(testKey), testValue);
        });

        it('should throw an error on creation of entry with duplicate key', function () {
            let testKey = 'testKey1';
            let testValue = {
                'testField': 'testValue',
            };
            try {
                dataStore.create(testKey, testValue);
            } catch (error) {
                assert.strictEqual(error.message, `key-value pair already exists with key ${testKey}`);
            }
        });

        it('should throw an error for key size > 32', function () {
            let testKey = 'this_is_supposed_to_be_a_very_long_key_that_will_throw';
            let testValue = {
                'testField': 'testValue',
            };
            try {
                dataStore.create(testKey, testValue);
            } catch (error) {
                assert.strictEqual(error.message, 'key size exceeds 32 characters');
            }
        });

        it('should throw an error for value being greater than 16KB', function () {
            let testKey = 'testKey3';
            let testValue = {};
            for (var i = 0; i < 20000; i++)
                testValue[`key-${i}`] = i;
            try {
                dataStore.create(testKey, testValue);
            } catch (error) {
                assert.strictEqual(error.message, 'value size exceeds 16KB');
            }
        });
    });

    describe('#del()', function () {
        it('should delete entry with provided key', function () {
            let testKey = 'testKey4';
            let testValue = {
                'testField': 'testValue',
            };
            try {
                dataStore.create(testKey, testValue);
                dataStore.del(testKey);
                dataStore.read(testKey);
            } catch (error) {
                assert.strictEqual(error.message, `key ${testKey} does not exist`);
            }
        });

        it('should throw an error for deleting non-existent key', function () {
            let testKey = 'testKey5';
            try {
                dataStore.del(testKey);
            } catch (error) {
                assert.strictEqual(error.message, `key ${testKey} does not exist`);
            }
        });
    });
});

dataStore.close();