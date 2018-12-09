const express = require('express');
const test = express();
test.get('/mochi',(req,res)=>{
    res.send("Hello Mochi.")
})
test.get('/',(req,res)=>{
    res.send("Hello void.")
})
module.exports = test
