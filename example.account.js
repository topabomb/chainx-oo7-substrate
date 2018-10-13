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
var alice_account_public = '0x' + bytesToHex(alice_account_u8); //公钥
var alice_account_address = substrate.ss58Encode(alice_account_u8);

console.log('decode#' + alice_account_u8);
console.log('public#' + alice_account_public);
console.log('address#' + alice_account_address);



//获取storagekey
// console.log(xxhash(alice_account_u8,128));
var storage_hash = storageKey('Balances FreeBalance', alice_account_u8);
console.log('storeagekey#' + storage_hash);








substrate.runtimeUp.then(() => {


    substrate.runtime.balances.transferFee.tie((data) => {
        console.log('transferFee#' + data);
    });

    substrate.runtime.balances.freeBalance(alice_account_public).tie((alice) => {
        console.log('alice freeBalance#' + alice);
    });

    substrate.runtime.balances.totalBalance(alice_account_public).tie((alice) => {
        console.log('alice totalBalance#' + alice);
    });

    
    
});

    


    

   

