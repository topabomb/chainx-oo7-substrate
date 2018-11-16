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
    VecU8,
    OrderPair,
    OrderType,
    TokenSymbol,
    TokenBalance
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
substrate.setNodeUri(['ws://192.168.1.25:9067']);

var alice_seed = 'Alice                           ';
var alice_account_58 = '5GoKvZWG5ZPYL1WUovuHW3zJBWBP5eT8CbqjdRY4Q6iMaDtZ';
var alice_account_u8 = substrate.ss58Decode(alice_account_58); //58地址=》u8
var alice_account_public = '0x' + bytesToHex(alice_account_u8); //公钥
var alice_account_address = substrate.ss58Encode(alice_account_u8);
//var alice=new AccountId(alice_account_u8);

console.log('decode#' + alice_account_u8);
console.log('public#' + alice_account_public);
console.log('address#' + alice_account_address);
//秘钥管理
var secretstore = substrate.secretStore();
//注意!
//submitFromSeed只是为了适应ychainx的测试链配置，正式环境应该使用 submit方法
secretstore.submitFromSeed(alice_seed, 'alice');
var alice = secretstore.find('alice');
secretstore.submit('chainx', 'alan'); //密码
var alan = secretstore.find('alan');


substrate.runtimeUp.then(() => {

    let tokenbalances = substrate.runtime.tokenbalances;

    tokenbalances.tokenListLen.then(data => {
        //console.log('#tokenListLen:' + data);

        for (var i = 0; i < data; i++) {
            tokenbalances.tokenListMap(i).tie(token => {

                // 获取每个token的信息
                tokenbalances.tokenInfo(token).then(info => {
                    console.log('#token:' + token.toString())
                    console.log('#symbol:' + info[0].symbol.toString())
                    console.log('#token_desc:' + info[0].token_desc.toString())
                    console.log('#precision:' + info[0].precision)
                    console.log('#' + info[1])
                })
            })

        }

    })

    //获取账户的token列表
    tokenbalances.tokenListOf(alice.account).tie(data => {

        for (var i = 0; i < data.length; i++) {
            let token = data[i]
            let tokenname = data[i]
            console.log('token->' + token.toString());
            //获取账户的token的freebalance
            (function (token) {
                tokenbalances.freeToken([alice_account_public, token]).then(free => {
                    console.log(alice_account_public + '#' + token.toString() + '#free#' + free);
                })
            })(token)


            //获取账户的token的reservedbalance
            tokenbalances.reservedToken([alice_account_public, tokenname]).then(free => {
                console.log(alice_account_public + '#' + tokenname.toString() + '#reserved#' + free);
            })
        }

    })


    // // token 转账
    var symbol = new TokenSymbol(stringToBytes('btc'));
    substrate.calls.tokenbalances.transferToken(alan.account, symbol, 10).then(transfer_token => {

        substrate.post({
            sender: alice.account,
            call: transfer_token
        }).tie((data) => {
            console.log(data)

        })
    })

    // 申请提现

    substrate.calls.financialrecords.withdraw( symbol, 100).then(withdraw => {

        substrate.post({
            sender: alan.account,
            call: withdraw
        }).tie((data) => {
            console.log('withdraw='+ data )

        })
    })
})
