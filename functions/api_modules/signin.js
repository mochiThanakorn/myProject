const express = require('express')
const app = express()
const db = require('./db_connect')

app.post('/',(req, res) => {  
    if(typeof req.body == 'object') {
        var data = req.body
    } else {
        var data = JSON.parse(req.body)
    } 
    if (data.username && data.username=="" && data.password && data.password=="") {
        res.status(400).json({msg:"Username and Password is null."})
    } else if (data.username=="") {
        res.status(400).json({msg:"Username is null."})
    } else if (data.password=="") {
        res.status(400).json({msg:"Password is null."})
    }
    console.log("username: "+data.username+", password: "+data.password)
    db.collection("employees").where("user.username", "==",data.username).where("user.password", "==",data.password).get().then(docs => { 
        if (docs.empty) {
            res.status(401).json({msg:"incorrect username or password"})
        } else {
            docs.forEach((doc) => {
                res.status(200).json({
                    id: doc.id,
                    name: doc.data().name,
                    surname: doc.data().surname,
                    //typeAccount:doc.data().user.typeAccount,
                    userToken: doc.data().user.userToken,
                    username: doc.data().user.username,
                    authority: doc.data().user.authority
                })          
            }) 
        }                   
    })
    .catch((error) => {
        res.status(400).json({msg:'Error : Permission denied!'})
    })
})

app.post('/new',(req, res) => {  
    if(typeof req.body == 'object') {
        var data = req.body
    } else {
        var data = JSON.parse(req.body)
    } 
    if (data.username && data.username=="" && data.password && data.password=="") {
        res.status(400).json({msg:"Username and Password is null."})
    } else if (data.username=="") {
        res.status(400).json({msg:"Username is null."})
    } else if (data.password=="") {
        res.status(400).json({msg:"Password is null."})
    }
    db.collection("employees").where("user.username", "==",data.username).where("user.password", "==",data.password).get().then(docs => { 
        if (docs.empty) {
            res.status(401).json({msg:"incorrect username or password"})
        } else {
            docs.forEach((doc) => {
                res.status(200).json({
                    id:doc.id,
                    name:doc.data().name,
                    surname:doc.data().surname,
                    typeAccount:doc.data().typeAccount,
                    authority:doc.data().user.authority
                })          
            }) 
        }                   
    })
    .catch((error) => {
        res.status(400).json({msg:'Error : Permission denied!'})
    })
})

module.exports = app