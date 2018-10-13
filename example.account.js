var substrate = require('oo7-substrate');
const {
    bytesToHex
} = require('./src/utils')
const {
    AccountId
} = require('./src/types')
global.localStorage = {};

const {
    xxhash
} = require('@polkadot/util-crypto/xxhash');

const {
    storageKey,
    StorageBond
} = require('./src/storageBond')

window = global;

//设置节点
substrate.setNodeUri(['ws://127.0.0.1:8082']);

var alice_seed = 'Alice';
var alice_account_58 = '5GoKvZWG5ZPYL1WUovuHW3zJBWBP5eT8CbqjdRY4Q6iMaDtZ';
var alice_account_u8 = substrate.ss58Decode(alice_account_58); //58地址=》u8
var alice_account_public = bytesToHex(alice_account_u8); //公钥
var alice_account_address = substrate.ss58Encode(alice_account_u8);

console.log('decode#' + alice_account_u8);
console.log('public#' + alice_account_public);
console.log('address#' + alice_account_address);

var secret_store = substrate.secretStore();
var pub = secret_store.submit(alice_seed, 'alice'); //私钥存储
console.log('account#' + secret_store.accounts());
console.log('pubkey#' + pub);
console.log(secret_store.find('alice'));


//获取storagekey
// console.log(xxhash(alice_account_u8,128));
var storage_hash = storageKey('Balances FreeBalance', alice_account_u8);
console.log(storage_hash);



runtime.core.metaData.tie(d => {
    console.log(d);
})

substrate.runtimePromise().then((runtime) => {
    runtime.balances.transferFee.log().then((data) => {
        console.log(data);
    });

    runtime.balances.freeBalance('0xd172a74cda4c865912c32ba0a80a57ae69abae410e5ccb59dee84e2f4432db4f').log().then((alice) => {
        console.log(alice);
    });

});



substrate.callsPromise().then((calls) => {
    console.log(calls);
});
substrate.initRuntime(function (d) {
    console.log('init#' + d);
});

console.log(substrate.callsPromise(function (data) {
    console.log('callPromise#' + data);
}));