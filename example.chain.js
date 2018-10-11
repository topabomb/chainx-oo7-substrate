
var substrate=require('oo7-substrate');
window=global;

//设置节点
substrate.setNodeUri('ws://127.0.0.1:8082');

var chain=substrate.chain;

//订阅块高
chain.height.tie((height=>{
    console.log('number#'+height.toString());
}));

//获取指定块高的哈希
chain.hash(100).tie((hash)=>{
    console.log('hash#'+hash);
});

//订阅新区块头
chain.head.tie(((header)=>{
    console.log('head#');
    console.log(header);
    
    //通过块哈希获取块头
    chain.header(header.parentHash).tie((header)=>{
        console.log('parent->header#');
        console.log(header);
    });

    //通过块哈希获取区块
    chain.block(header.parentHash).tie((block)=>{
        console.log('block#');
        console.log(block);
    });
}));

