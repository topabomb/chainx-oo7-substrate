var substrate = require('oo7-substrate');
const {
    bytesToHex,
    toLE,
    stringToBytes
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
substrate.setNodeUri(['ws://127.0.0.1:8082']);
//substrate.setNodeUri(['ws://192.168.1.237:8084']);
//substrate.setNodeUri(['ws://192.168.1.25:808']);
//substrate.setNodeUri(['ws://47.105.73.172:8082']);

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

//秘钥管理
var secretstore = substrate.secretStore();

//注意! 
//submitFromSeed只是为了适应ychainx的测试链配置，正式环境应该使用 submit方法
secretstore.submitFromSeed(alice_seed, 'alice');
var alice = secretstore.find('alice');
console.log('match alice#' + alice.account.toHex());

secretstore.submit('chainx', 'alan'); //密码
var alan = secretstore.find('alan');
console.log('match alan#' + alan.account.toHex());

var jack_mnemonic = secretstore.create(); // 生成新账户的助记词
console.log('jack 的助记词' + jack_mnemonic);
secretstore.submit(jack_mnemonic, 'jack');
var jack = secretstore.find('jack');
console.log('match jack#' + jack.account.toHex());



substrate.runtimeUp.then(() => {

    substrate.runtime.staking.currentEra.tie((data) => {
        console.log('CurrentEra=' + data);
    })

    substrate.runtime.balances.transferFee.tie((data) => {
        console.log('transferFee#' + data);
    });

    substrate.runtime.balances.freeBalance(alice_account_public).tie((alice) => {
        console.log('alice freeBalance#' + alice);
    });

    substrate.runtime.balances.totalBalance(alice_account_public).then((alice) => {
        console.log('alice totalBalance#' + alice);
    });

    substrate.runtime.staking.validators.then((data) => {
        for (var i = 0; i < data.length; i++) {
            console.log('[' + i + ']=>0x' + bytesToHex(data[i].who));
        }

    });

    //转账前余额
    substrate.runtime.balances.freeBalance(alice_account_public).then((alice) => {
        console.log('before------alice freeBalance#' + alice);
    });
    substrate.runtime.balances.freeBalance(alan.account).then((alan) => {
        console.log('before------alan freeBalance#' + alan);
    });

    //构造交易参数
    substrate.calls.balances.transfer(alan.account, 1000).tie((transfer_to_alan) => {

        substrate.calls.staking.stake(stringToBytes('name'), stringToBytes('url')).tie(data => {
            console.log('stake=' + data.toString());
        })
        substrate.runtime.staking.nameOfIntention('5GoKvZWG5ZPYL1WUovuHW3zJBWBP5eT8CbqjdRY4Q6iMaDtZ').tie(data => {
            console.log('data=' + data)
        })

        console.log(substrate.runtime.staking.nominationTo)

        substrate.runtime.staking.nominationTo(['5GoKvZWG5ZPYL1WUovuHW3zJBWBP5eT8CbqjdRY4Q6iMaDtZ', '5GoKvZWG5ZPYL1WUovuHW3zJBWBP5eT8CbqjdRY4Q6iMaDtZ']).tie(data => {
            console.log('nominationTo=' + data)
        })

        substrate.runtime.balances.totalBalance(alice_account_public).then((alice) => {
            console.log('totalBalance=' + alice)
        })

        // substrate.runtime.system.account_nonce(alice_account_public).tie(data=>{
        //     console.log('nonce='+data);
        // })
        //发送交易
        substrate.post({
            sender: alice.account,
            call: transfer_to_alan
        }).tie((data) => {
            console.log(data);

            //交易被确认
            if (data.finalised) {
                substrate.runtime.balances.freeBalance(alice_account_public).then((alice) => {
                    console.log('after-------alice freeBalance#' + alice);
                });
                substrate.runtime.balances.freeBalance(alan.account).then((alan) => {
                    console.log('after-------alan freeBalance#' + alan);
                });

                //向jack转账
                //构造交易参数
                substrate.calls.balances.transfer(jack.account, 1000).tie((transfer_to_jack) => {
                    //发送交易
                    substrate.post({
                        sender: alice.account,
                        call: transfer_to_jack
                    }).tie((data) => {
                        console.log(data);

                        //交易被确认
                        if (data.finalised) {
                            substrate.runtime.balances.freeBalance(alice_account_public).then((alice) => {
                                console.log('after-------alice freeBalance#' + alice);
                            });
                            substrate.runtime.balances.freeBalance(jack.account).then((jack) => {
                                console.log('after-------jack freeBalance#' + jack);
                            });
                        }

                    });
                });

            }

        });
    });




    //then: 得到返回数据后触发回调，自动调用finalise 取消订阅
    //tie:得到返回数据后触发回调
    //finalise:显式取消订阅

});