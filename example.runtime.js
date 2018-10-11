var substrate=require('oo7-substrate');
const { bytesToHex } = require('./src/utils')
window=global;

//设置节点
substrate.setNodeUri('ws://127.0.0.1:8082');

var runtime=substrate.runtime;

//获取验证人数量
runtime.core.authorityCount.tie((authoritycount)=>{
    console.log('authoritycount#'+authoritycount)
});

//获取验证人列表
runtime.core.authorities.tie((authorities)=>{
    for( var i=0;i<authorities.length;i++){
        console.log('authorities#'+i+' '+bytesToHex(authorities[i].toJSON().data));
    }
});

//获取runtime 代码
runtime.core.code.tie((code)=>{
    console.log('code#'+bytesToHex(code));
});


//订阅获取runtime 哈希  可以实时更新runtime
runtime.core.codeHash.tie((codehash)=>{
    console.log('codehash#'+bytesToHex(codehash));
});

//订阅获取runtime 代码长度 可以实时更新runtime
runtime.core.codeSize.tie((codesize)=>{
    console.log('codesize#'+codesize);
});