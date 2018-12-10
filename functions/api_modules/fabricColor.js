const express = require('express');
const app = express();
const db = require('./db_connect');

//fabric color
app.get('/',(req, res) => {
    var employeeArr = [];
    if(typeof req.query.id !== "undefined") {
        db.collection('fabricColor').where('id', '==', req.query.id).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
                    id : doc.id,
                    name: doc.data().name,
                    code: doc.data().code
                })
            });
            res.status(200).send(employeeArr);
        })
        .catch((err) => {
            res.status(401).json({error:err});
        });
    }
    else {
        db.collection('fabricColor').orderBy("name").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
                    id : doc.id,
                    name: doc.data().name,
                    code: doc.data().code
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
    if(typeof req.query.id !== "undefined") {
        if(typeof req.body == 'object') {
            var data = req.body
        }
        else {
            var data = JSON.parse(req.body)
        }
        var sfDocRef = db.collection("fabricColor").doc(req.query.id);
        return db.runTransaction(function(transaction) {
            return transaction.get(sfDocRef).then(function(sfDoc) {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                    //throw "Document does not exist!";
                }       
                transaction.update(sfDocRef, { 
                    name: data.name,
                    code: data.code
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
    db.collection('fabricColor').doc().set({       
        name: data.name,
        code: data.code     
    })
    res.status(200).send('Add fabric roll successful.');
});
app.delete('/',(req, res) => {
    db.collection("fabricColor").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

module.exports = app