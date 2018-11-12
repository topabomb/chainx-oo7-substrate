

let metadata = { set: m => { this.data = m
    console.log('m---->'+JSON.stringify(this.data)+m)} }

module.exports = metadata 