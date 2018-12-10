const express = require('express');
const app = express();
const db = require('./db_connect');

app.post('/',(req, res) => {  
    if(typeof req.body == 'object') {
        var user = req.body
    } else {
        var user = JSON.parse(req.body)
    } 
    if (user.username && user.username=="" && user.password && user.password=="") {
        res.json({msg:"Username and Password is null."});
    } else if (user.username=="") {
        res.json({msg:"Username is null."});
    } else if (user.password=="") {
        res.json({msg:"Password is null."});
    }
    db.collection("users").where("username", "==",user.username).where("password", "==",user.password).get().then(docs => { 
        if (docs.empty) {
            res.status(401).json({msg:"incorrect username or password"})
        } else {
            docs.forEach(function(doc) {
                res.status(200).json({
                    id:doc.id,
                    name:doc.data().name,
                    surname:doc.data().surname,
                    typeAccount:doc.data().typeAccount,
                    authority:doc.data().authority
                });          
            }) 
        }                   
    })
    .catch((error) => {
        res.json({msg : error});
    });
})

module.exports = app