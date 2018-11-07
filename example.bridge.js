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

window = global;

//设置节点
//substrate.setNodeUri(['ws://127.0.0.1:8082']);
//substrate.setNodeUri(['ws://192.168.1.237:8084']);
substrate.setNodeUri(['ws://192.168.1.25:8082']);
//substrate.setNodeUri(['ws://47.105.73.172:8082']);

var alice_seed = 'Alice';
var alice_account_58 = '5GoKvZWG5ZPYL1WUovuHW3zJBWBP5eT8CbqjdRY4Q6iMaDtZ';
var alice_account_u8 = substrate.ss58Decode(alice_account_58); //58地址=》u8
var alice_account_public = '0x' + bytesToHex(alice_account_u8); //公钥
var alice_account_address = substrate.ss58Encode(alice_account_u8);

console.log('decode#' + alice_account_u8);
console.log('public#' + alice_account_public);
console.log('address#' + alice_account_address);


substrate.runtimeUp.then(() => {

    function getTxByNum(number) {
        bridgeofbtc.hashForNumber(number).tie(hash => {
            console.log('#num=' + number + ',hash=' + hash.toRightHex())
            bridgeofbtc.blockTxids(hash).tie(data => {
                //console.log(data)
                for (var i = 0; i < data.length; i++) {
                    console.log('#blockTxids:[' + i + '] ' + data[i].toRightHex())

                    bridgeofbtc.txSet(data[i]).tie(tx => {
                        console.log('AccountId#' + '=>' + bytesToHex(tx[0]))
                        console.log('btcAddress#' + '=>' + toBtcAddress(tx[1].hash.toHex(), 'testnet'))
                        console.log('TxType#' + '=>' + (tx[2].toName()))
                        console.log('value#' + '=>' + tx[3])
                    })

                }
            })
        })
    }

    let bridgeofbtc = substrate.runtime.bridge_btc;

    bridgeofbtc.bestIndex.tie(data => {
        console.log('#block number:' + data.number);
        console.log('#block hash:0x' + data.hash.toRightHex());

        let number = parseInt(data.number)

        bridgeofbtc.hashsForNumber(number).tie(hashlist => {
            for (var j = 0; j < hashlist.length; j++) {
                console.log('#hashsForNumber:' + number + '->0x' + hash.toRightHex())
            }
            //第一个
            var hash = hashlist[0];

            bridgeofbtc.numberForHash(hash).tie(height => {
                console.log('#NumberForHash:' + height)
            })

            bridgeofbtc.blockHeaderFor(hash).then(data => {
                let header = data[0]
                let account = data[1]
                console.log('#BlockHeaderFor:AccountId->' + account.toHex())
                console.log('#BlockHeaderFor:' + hash.toRightHex() + '->version:0x' + toRIHex(header.version, 4))
                console.log('#BlockHeaderFor:' + hash.toRightHex() + '->previous_header_hash:' + header.previous_header_hash.toRightHex())
                console.log('#BlockHeaderFor:' + hash.toRightHex() + '->merkle_root_hash:' + header.merkle_root_hash.toRightHex())
                console.log('#BlockHeaderFor:' + hash.toRightHex() + '->time:' + header.time)
                console.log('#BlockHeaderFor:' + hash.toRightHex() + '->bits:' + header.bits)
                console.log('#BlockHeaderFor:' + hash.toRightHex() + '->nonce:' + header.nonce)
                let blocknumber = data[2]
                console.log('#BlockHeaderFor:' + hash.toRightHex() + '->blocknumber:' + blocknumber)

            })


        })
    })

    getTxByNum(918004)


    bridgeofbtc.utxoMaxIndex.tie(maxindex => {
        console.log('UTXOMaxIndex#' + maxindex)
        bridgeofbtc.utxoSet(maxindex - 1).tie(utxo => {
            console.log('utxo txid#' + utxo.txid.toRightHex())
            console.log('utxo index#' + utxo.index)
            console.log('utxo balance#' + utxo.balance)
            console.log('utxo is_spent#' + utxo.is_spent)
        })
    })


});
