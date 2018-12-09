const express = require('express');
const app = express();
const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const firebaseApp2 = firebase.initializeApp(
    functions.config().firebase
);
var db = firebaseApp2.firestore();

//fabric roll
app.get('/',(req, res) => {
    var employeeArr = [];
    if(typeof req.query.id !== "undefined") {
        db.collection('fabricRolls').where('id', '==', req.query.id).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
                    id : doc.id,
                    idFabricType: doc.data().idFabricType,
                    idFabricColor: doc.data().idFabricColor,
                    size: doc.data().size,
                    weight: doc.data().weight   
                })
            });
            res.status(200).send(employeeArr);
        })
        .catch((err) => {
            res.status(401).json({error:err});
        });
    }
    else {
        db.collection('fabricRolls').get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
                    id : doc.id,
                    idFabricType: doc.data().idFabricType,
                    idFabricColor: doc.data().idFabricColor,
                    size: doc.data().size,
                    weight: doc.data().weight  
                })
            });
            res.status(200).send(employeeArr);
        })
        .catch((err) => {
            res.status(401).json({error:err});
        });
    }
});

app.put('/',(req, res) => {
    //ถ้าไอดีไม่ตรงยังมีปัญหาอยู่
    //เพิ่มตรวจjson input
    if(typeof req.query.id !== "undefined") {
        if(typeof req.body == 'object') {
            var data = req.body
        }
        else {
            var data = JSON.parse(req.body)
        }
        var sfDocRef = db.collection("fabricRolls").doc(req.query.id);
        return db.runTransaction(function(transaction) {
            return transaction.get(sfDocRef).then(function(sfDoc) {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                    //throw "Document does not exist!";
                }       
                transaction.update(sfDocRef, { 
                    id : data.id,
                    idFabricType: data.data().idFabricType,
                    idFabricColor: data.data().idFabricColor,
                    size: data.data().size,
                    weight: data.data().weight
                });
            });
        }).then(function() {
            res.status(200).send("Transaction successfully committed!")
        }).catch(function(errorMsg) {
            res.status(401).json({error : errorMsg})
        });
    }
    else {
        res.send(401).send("not found id")
    }
});
app.post('/',(req, res) => {
    // add feature console log check data when data is undefined
    if(typeof req.body == 'object') {
        var data = req.body
    }
    else {
        var data = JSON.parse(req.body)
    }
    console.log(data)
    db.collection('fabricRolls').doc().set({       
        idFabricType: data.data().idFabricType,
        idFabricColor: data.data().idFabricColor,
        size: data.data().size,
        weight: data.data().weight     
    })
    res.status(200).send('Add fabric roll successful.');
});
app.delete('/',(req, res) => {
    db.collection("fabricRolls").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

module.exports = app