const express = require('express');
const app = express();
const db = require('./db_connect');

app.get('/',(req, res) => {
    var employeeArr = [];
    if(typeof req.query.id !== "undefined") {
        db.collection('users').doc(req.query.id).get()
        .then((doc) => {
            if (doc.exists) {
                res.json({
                    id : doc.id,
                    username: doc.data().username,
                    password: doc.data().password,
                    idEmployee: doc.data().idEmployee,
                    name: doc.data().name,
                    surname: doc.data().surname,
                    registerDate: doc.data().registerDate,
                    authority: doc.data().authority 
                })
            } else {
                res.send("No such document!");
            }
        })
    .catch((err) => {
        res.status(401).send('Error getting documents', err);
    });
    }
    else if(typeof req.query.name !== "undefined") {
        db.collection('users').where('name', '==', req.query.name).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
                    id : doc.id,
                    username: doc.data().username,
                    password: doc.data().password,
                    idEmployee: doc.data().idEmployee,
                    name: doc.data().name,
                    surname: doc.data().surname,
                    registerDate: doc.data().registerDate,
                    authority: doc.data().authority    
                })
            });
            res.status(200).send(employeeArr);
        })
        .catch((err) => {
            res.status(401).json({error:err});
        });
    }
    else {
        db.collection('users').orderBy("username").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
                    id : doc.id,
                    username: doc.data().username,
                    password: doc.data().password,
                    idEmployee: doc.data().idEmployee,
                    name: doc.data().name,
                    surname: doc.data().surname,
                    registerDate: doc.data().registerDate,
                    authority: doc.data().authority  
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
            var user = req.body
        }
        else {
            var user = JSON.parse(req.body)
        }
        var user = JSON.parse(req.body)
        var sfDocRef = db.collection("users").doc(req.query.id);
        return db.runTransaction(function(transaction) {
            return transaction.get(sfDocRef).then(function(sfDoc) {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                    //throw "Document does not exist!";
                }       
                transaction.update(sfDocRef, { 
                    username: user.username,
                    password: user.password,
                    idEmployee: user.idEmployee,
                    name: user.name,
                    surname: user.username,
                    registerDate: user.registerDate,
                    authority: user.authority
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
    if(typeof req.body == 'object') {
        var user = req.body
    }
    else {
        var user = JSON.parse(req.body)
    }
    db.collection('users').doc().set({       
        username: user.username,
        password: user.password,
        idEmployee: user.idEmployee,
        name: user.name,
        surname: user.username,
        registerDate: user.registerDate,
        authority: user.authority       
    })
    res.status(200).send('Add user successful.');
});
app.delete('/',(req, res) => {
    db.collection("users").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

module.exports = app