var substrate = require('oo7-substrate');
window = global;

//设置节点
substrate.setNodeUri(['ws://127.0.0.1:8082']);

var chain = substrate.chain;


substrate.runtimeUp.then(() => {
    //订阅新区块头
    chain.head.tie(((header) => {
       
        substrate.runtime.system.events.then(e=>{
            console.log(e)
        })
       
    }));

})


