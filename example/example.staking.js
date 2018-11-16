var substrate = require('oo7-substrate');
const {
    bytesToHex,
    toLE,
    stringToBytes,
    toLEHex,
    toRIHex,
    toBtcAddress
} = require('./src/utils')
const {
    AccountId,
    Balance,
    VecU8
} = require('./src/types')
global.localStorage = {};

const {
    xxhash
} = require('@polkadot/util-crypto/xxhash');

const {
    storageKey,
    StorageBond
} = require('./src/storageBond')

const {
    BigNumber
} = require('bignumber.js');
const bitcoin = require("bitcoinjs-lib")
const bscript = bitcoin.script
const OPS = require('bitcoin-ops')
const OP_INT_BASE = OPS.OP_RESERVED // OP_1 - 1

window = global;

//设置节点
substrate.setNodeUri(['ws://127.0.0.1:8082']);

var alice_seed = 'Alice';
var alice_account_58 = '5GoKvZWG5ZPYL1WUovuHW3zJBWBP5eT8CbqjdRY4Q6iMaDtZ';
var alice_account_u8 = substrate.ss58Decode(alice_account_58); //58地址=》u8
var alice_account_public = '0x' + bytesToHex(alice_account_u8); //公钥
//var alice_account_address = substrate.ss58Encode(alice_account_u8);

console.log('decode#' + alice_account_u8);
console.log('public#' + alice_account_public);
//console.log('address#' + alice_account_address);


substrate.runtimeUp.then(() => {

    staking=substrate.runtime.staking


    staking.nominationRecords(alice_account_u8).tie(nominationRecords => {
        console.log('#nominationRecords '+JSON.stringify( nominationRecords) )
    })

   
   
});






