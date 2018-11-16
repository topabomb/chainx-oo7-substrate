var substrate = require('./');
window = global;

//设置节点
//substrate.setNodeUri(['ws://127.0.0.1:8082']);
substrate.setNodeUri(['ws://192.168.1.237:8082']);

var system = substrate.system;

system.name.tie((name) => {
    console.log('name#' + name);
});

system.version.tie((version) => {
    console.log('version#' + version);
});

system.chain.tie((chain) => {
    console.log('chain#' + chain);
});

