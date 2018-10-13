var substrate=require('oo7-substrate');
const { bytesToHex } = require('./src/utils')
const {xxhash}=require('@polkadot/util-crypto/xxhash');
const { storageKey, StorageBond } = require('./src/storageBond')
const { decode, encode } = require('./src/codec');

window=global;

//设置节点
substrate.setNodeUri(['ws://127.0.0.1:8082']);

var alice_seed='Alice';
var alice_account_58='5GoKvZWG5ZPYL1WUovuHW3zJBWBP5eT8CbqjdRY4Q6iMaDtZ';
var alice_account_u8=substrate.ss58Decode(alice_account_58);   //58地址=》u8
var alice_account_public=bytesToHex(alice_account_u8);  //公钥
var alice_account_address=substrate.ss58Encode(alice_account_u8);

var runtime=substrate.runtime;



(async()=>{
        //获取验证人数量
        await runtime.core.authorityCount.tie((authoritycount)=>{
            console.log('authoritycount#'+authoritycount)
        });

        //获取验证人列表
        await runtime.core.authorities.then((authorities)=>{
            for( var i=0;i<authorities.length;i++){
                console.log('authorities#'+i+' '+bytesToHex(authorities[i].toJSON().data));
            }
        });

        //获取runtime 代码
        await runtime.core.code.then((code)=>{
           // console.log('code#'+bytesToHex(code));
        });


        //订阅获取runtime 哈希  可以实时更新runtime
        await runtime.core.codeHash.tie((codehash)=>{
            console.log('codehash#'+bytesToHex(codehash));
        });

        //订阅获取runtime 代码长度 可以实时更新runtime
        await runtime.core.codeSize.tie((codesize)=>{
            console.log('codesize#'+codesize);
        });

        await runtime.core.heappages.then((heappages)=>{
            console.log('heappages#'+heappages);
        });
        await runtime.core.heappages.finalise();



        //  获取storagekey 
        var storage_hash=storageKey('Balances FreeBalance',alice_account_u8);
        console.log('storage_hash#'+storage_hash);//0xce3f3d8f09e3411403f5ca59d042a40e

        await runtime.core.sub_storage(storage_hash).then((data)=>{
            console.log('balance#'+decode(data, 'Balance'));
        });
        
})()
