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
    OrderType
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
substrate.setNodeUri(['ws://192.168.1.237:9067']);

var alice_seed = 'Alice';
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

secretstore.submitFromSeed('Bob', 'bob');
var bob = secretstore.find('bob');

let pair = new OrderPair('pcx', 'btc', 8);

substrate.runtimeUp.then(() => {

    let pendingorders = substrate.runtime.pendingorders;

    pendingorders.orderPairList.then(pair => {

        for (var i = 0; i < pair.length; i++) {
            console.log('#pairlist' + pair[i].toString())
        }
    })
    function print_orderlist(account, pair) {
        // 用户的最新一笔挂单序号
        pendingorders.lastOrderIndexOf([account, pair]).then(data => {
            console.log('#lastOrderIndexOf:' + data);

            for (var i = 1; i <= data; i++) {
                //查看挂单详情

                pendingorders.ordersOf([account, pair, i]).then(order => {
                    console.log('----------' + account.toHex() + '--#index:' + order.index)
                    console.log('#pair:' + order.pair)
                    console.log('#ordertype:' + order.ordertype)
                    console.log('#user:' + order.user.toHex())
                    console.log('#amount:' + order.amount)
                    console.log('#hasfill_amount:' + order.hasfill_amount)
                    console.log('#price:' + order.price)
                    console.log('#create_time:' + order.create_time)
                    console.log('#lastupdate_time:' + order.lastupdate_time)
                    console.log('#status:' + order.status)
                    console.log('#fill_index:' + order.fill_index)
                })
            }


        })
    }

    function print_filllist(pair) {
        // 最后成交列表
        pendingorders.fillIndexOf(pair).then(data => {
            console.log('#fillIndexOf:' + data);

            for (var i = data; (i > data - 10) && (i > 0); i--) {
                //查看成交详情
                pendingorders.fillsOf([pair, i]).then(fill => {
                    console.log('----------' + pair + '--:' + fill.index)
                    console.log('#index:' + fill.index)
                    console.log('#maker_user:' + fill.maker_user.toHex())
                    console.log('#taker_user:' + fill.taker_user.toHex())
                    console.log('#maker_user_order_index:' + fill.maker_user_order_index)
                    console.log('#taker_user_order_index:' + fill.taker_user_order_index)
                    console.log('#price:' + fill.price)
                    console.log('#amount:' + fill.amount)
                    console.log('#maker_fee:' + fill.maker_fee)
                    console.log('#taker_fee:' + fill.taker_fee)
                    console.log('#time:' + fill.time)
                })
            }

        })
    }


    let buy = new OrderType('Buy');
    //挂买单
    substrate.calls.pendingorders.putOrder(pair, buy, 10, 10/*,"imtoken"*/).then(putorder => {

        substrate.post({
            sender: alice.account,
            call: putorder
        }).tie((data) => {
            console.log(data)

        })
    })
    //print_orderlist(alice.account, pair)
    print_orderlist(bob.account, pair)
    // // //挂卖掉
     let sell = new OrderType('Sell');
    // substrate.calls.pendingorders.putOrder(pair, sell, 20, 10,"imtoken").then(sell_order => {



    //     substrate.post({
    //         sender: bob.account,
    //         call: sell_order
    //     }).tie((data) => {
    //         console.log(data)

    //     })
    // })
    // print_orderlist(bob.account, pair)
    // //取消挂单
    // substrate.calls.pendingorders.cancelOrder(pair, 2).then(putorder => {
    //     substrate.post({
    //         sender: alice.account,
    //         call: putorder
    //     }).tie((data) => {
    //         console.log(data)

    //     })
    // })

    // //成交历史
    // print_filllist(pair);


    function getNode(nodeid) {
        substrate.runtime.matchorder.bidListCache(nodeid).then(node => {
            console.log(node)
            console.log('-------------' + nodeid + '---------')
            console.log('#node->data:' + JSON.stringify(node.get('data').toJSON()))
            //console.log(node.get('data').get('list'))
            for (var i = 0; i < node.get('data').get('list').length; i++) {
                substrate.runtime.matchorder.bidOf(node.get('data').get('list')[i]).then(biddetail => {
                    console.log('-------------#id->' + biddetail.get('id'))
                    console.log('#pair->' + biddetail.get('pair'))
                    console.log('#order_type->' + biddetail.get('order_type'))
                    console.log('#user->' + biddetail.get('user'))
                    console.log('#order_index->' + biddetail.get('order_index'))
                    console.log('#price->' + biddetail.get('price'))
                    console.log('#amount->' + biddetail.get('amount'))
                    console.log('#time->' + biddetail.get('time'))
                })
            }
            console.log('#node->prev:' + node.get('prev'))
            console.log('#node->next:' + node.get('next'))

            if (node.get('next') > 0)
                getNode(node.get('next'))

        })
    }
    function getBidList(pair, type) {
        substrate.runtime.matchorder.bidListHeaderFor([pair, type]).then(head => {
            //console.log(head)
            console.log('#header->multi_key=>(', head.get('multi_key')[0].toString() + ',' + head.get('multi_key')[1].toString() + ')')
            console.log('#header->index=>', head.get('index'))

            getNode(head.get('index'))
        })
    }

    //卖单盘口
   // getBidList(pair, sell);

    getBidList(pair, buy);

})
