const express = require('express');
const app = express();
const db = require('./db_connect');

app.get('/',(req, res) => {
    var employeeArr = [];
    if(typeof req.query.id !== "undefined") {
        db.collection('employee').doc(req.query.id).get()
        .then((doc) => {
            if (doc.exists) {
                res.json({
                    id : doc.id,
                    name : doc.data().name,
                    surname : doc.data().surname,
                    sex : doc.data().sex,
                    position : doc.data().position,
                    birthday : doc.data().birthday,
                    address : doc.data().address,
                    phoneNumber : doc.data().phoneNumber,
                    firstDayOfWork : doc.data().firstDayOfWork
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
        db.collection('employee').where('name', '==', req.query.name).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
                    id : doc.id,
                    name : doc.data().name,
                    surname : doc.data().surname,
                    sex : doc.data().sex,
                    birthday : doc.data().birthday,
                    position : doc.data().position,
                    address : doc.data().address,
                    phoneNumber : doc.data().phoneNumber,
                    firstDayOfWork : doc.data().firstDayOfWork   
                })
            });
            res.status(200).send(employeeArr);
        })
        .catch((err) => {
            res.status(401).json({error:err});
        });
    }
    else {
        db.collection('employee').orderBy("name").orderBy("surname").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
                    id : doc.id,
                    name : doc.data().name,
                    surname : doc.data().surname,
                    sex : doc.data().sex,
                    birthday : doc.data().birthday,
                    position : doc.data().position,
                    address : doc.data().address,
                    phoneNumber : doc.data().phoneNumber,
                    firstDayOfWork : doc.data().firstDayOfWork   
                })
            });
            res.status(200).send(employeeArr);
        })
        .catch((err) => {
            console.log("Error to get all employees.")
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
        var sfDocRef = db.collection("employee").doc(req.query.id);
        return db.runTransaction(function(transaction) {
            return transaction.get(sfDocRef).then(function(sfDoc) {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                    //throw "Document does not exist!";
                }       
                transaction.update(sfDocRef, { 
                    name : user.name, 
                    surname : user.surname, 
                    sex : user.sex,
                    birthday : user.birthday,
                    position : user.position,
                    address : user.address,
                    phoneNumber : user.phoneNumber,
                    firstDayOfWork : user.firstDayOfWork
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
    if(req.body.name!="" && req.body.surname!="" && req.body.sex!="" && req.body.birthday!="" && req.body.position!="" && req.body.address!="" && req.body.phoneNumber!="" && req.body.firstDayOfWork!="") {
        var user = req.body
    } 
    else {
        var user = JSON.parse(req.body)
    } 
    var docRef = db.collection('employee').doc();
    var setAda = docRef.set({       
        name: user.name,
        surname: user.surname,
        sex: user.sex,
        birthday: user.birthday,
        position: user.position,
        address: user.address,
        phoneNumber: user.phoneNumber,
        firstDayOfWork: user.firstDayOfWork 
    })
    res.status(200).send('Add complete');
});
app.delete('/',(req, res) => {
    db.collection("employee").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

module.exports = app