var substrate=require('oo7-substrate');
window=global;

var system=substrate.system;

system.name.tie((name)=>{
    console.log('name#'+name);
});

system.version.tie((version)=>{
    console.log('version#'+version);
});

system.chain.tie((chain)=>{
    console.log('chain#'+chain);
});