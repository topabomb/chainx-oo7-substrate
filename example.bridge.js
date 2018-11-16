var substrate = require('./');
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
//substrate.setNodeUri(['ws://127.0.0.1:8082']);
substrate.setNodeUri(['ws://192.168.1.25:9067']);
//substrate.setNodeUri(['ws://192.168.1.25:9067']);
//substrate.setNodeUri(['ws://47.105.73.172:8082']);

var alice_seed = 'Alice';
var alice_account_58 = '5GoKvZWG5ZPYL1WUovuHW3zJBWBP5eT8CbqjdRY4Q6iMaDtZ';
var alice_account_u8 = substrate.ss58Decode(alice_account_58); //58地址=》u8
var alice_account_public = '0x' + bytesToHex(alice_account_u8); //公钥
//var alice_account_address = substrate.ss58Encode(alice_account_u8);

console.log('decode#' + alice_account_u8);
console.log('public#' + alice_account_public);
//console.log('address#' + alice_account_address);


substrate.runtimeUp.then(() => {

    function getTxByNum(number) {
        bridgeofbtc.hashsForNumber(number).tie(hashlist => {
            if( hashlist.length == 0)
                return;
            var hash = hashlist[0];
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

    bridgeofbtc.redeemScript.then(RedeemScript=>{
        console.log('#RedeemScript :'+ RedeemScript)
        //var hex='52210257aff1270e3163aaae9d972b3d09a2385e0d4877501dbeca3ee045f8de00d21c2103fd58c689594b87bbe20a9a00091d074dc0d9f49a988a7ad4c2575adeda1b507c2102bb2a5aa53ba7c0d77bdd86bb9553f77dd0971d3a6bb6ad609787aa76eb17b6b653ae';
        //var asm=bscript.toASM(Buffer.from(hex, 'hex'))
        //console.log(bscript.fromASM(asm))
        var data=bscript.decompile(Buffer.from(RedeemScript.toString(), 'hex'))
        console.log(data)

        var m = data[0] - OP_INT_BASE
        var n = data[data.length - 2] - OP_INT_BASE
        var pubkeys = data.slice(1, -2)
        console.log('MultilSig:'+m+'/'+n)
        for( var i=0;i<pubkeys.length;i++){
            console.log('pubkey['+i+']='+bytesToHex(pubkeys[i]))
        }
    })

    bridgeofbtc.receiveAddress.then(ReceiveAddress=>{
        console.log('#ReceiveAddress '+toBtcAddress(ReceiveAddress.hash.toHex(), 'testnet'))
    })

     bridgeofbtc.bestIndex.tie(data => {
        console.log('#block number:' + data.number);
        console.log('#block hash:0x' + data.hash.toRightHex());

        let number = parseInt(data.number)

        bridgeofbtc.hashsForNumber(number).then(hashlist => {
            //第一个
            var hash = hashlist[0];

            for (var j = 0; j < hashlist.length; j++) {
                console.log('#hashsForNumber:' + number + '->0x' + hash.toRightHex())
            }

            bridgeofbtc.numberForHash(hash).tie(height => {
                console.log('#NumberForHash:' + height)
            })

            bridgeofbtc.blockHeaderFor(hash).then(data => {
                console.log(data)
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
                console.log('#BlockHeaderFor:account->'+account.toHex())
                console.log('#BlockHeaderFor:' + hash.toRightHex() + '->blocknumber:' + blocknumber)

            })

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
     })

    //getTxByNum(918004)


    bridgeofbtc.utxoMaxIndex.tie(maxindex => {
        console.log('UTXOMaxIndex#' + maxindex)
        for(var i=1;i<20;i++){
            (function(index){
                bridgeofbtc.utxoSet(index).tie(utxo => {
                    console.log('utxo txid#' + utxo.txid.toRightHex())
                    console.log('utxo index#' + utxo.index)
                    console.log('utxo balance#' + utxo.balance)
                    console.log('utxo is_spent#' + utxo.is_spent)
                })
            })(maxindex - i)
        }
        bridgeofbtc.utxoSet(maxindex - 1).tie(utxo => {
            console.log('utxo txid#' + utxo.txid.toRightHex())
            console.log('utxo index#' + utxo.index)
            console.log('utxo balance#' + utxo.balance)
            console.log('utxo is_spent#' + utxo.is_spent)
        })
    })

    //console.log(bridgeofbtc)

    bridgeofbtc.regInfoMaxIndex.then(maxindex => {
        //console.log('regInfoMaxIndex#' + maxindex)
        for(var i=1;i<2;i++){
            (function(index){
                bridgeofbtc.regInfoSet(index).tie(account => {
                    //console.log(account)
                    console.log('hash#' + '=>' + bytesToHex(account[0]))
                    console.log('btcAddress#' + '=>' + toBtcAddress(account[1].hash.toHex(), 'testnet'))
                    console.log('AccountId#' + '=>' + (account[2].toHex()))
                    console.log('BlockNumber#' + '=>' + (account[3]))
                    console.log('channel#' + '=>' + account[4])
                    console.log('TxType#' + '=>' + account[5].toName())
                })
            })(maxindex - i)
        }

    })


});






