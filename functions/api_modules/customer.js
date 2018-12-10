const express = require('express');
const app = express();
const db = require('./db_connect');

//Customer
app.get('/',(req, res) => {
    var employeeArr = [];
    if(typeof req.query.id !== "undefined") {
        db.collection('customer').doc(req.query.id).get()
        .then((doc) => {
            if (doc.exists) {
                res.json({
                    id : doc.id,
                    name : doc.data().name,
                    surname : doc.data().surname,
                    sex : doc.data().sex,
                    businessName : doc.data().businessName,
                    brandName : doc.data().brandName,
                    address : doc.data().address,  
                    phoneNumber : doc.data().phoneNumber,
                    blockScreen : doc.data().blockScreen,
                    note : doc.data().note 
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
        db.collection('customer').where('name', '==', req.query.name).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
                    id : doc.id,
                    name : doc.data().name,
                    surname : doc.data().surname,
                    sex : doc.data().sex,
                    businessName : doc.data().businessName,
                    brandName : doc.data().brandName,
                    address : doc.data().address,  
                    phoneNumber : doc.data().phoneNumber,
                    blockScreen : doc.data().blockScreen,
                    note : doc.data().note  
                })
            });
            res.status(200).send(employeeArr);
        })
        .catch((err) => {
            res.status(401).json({error:err});
        });
    }
    else {
        db.collection('customer').orderBy("name").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
                    id : doc.id,
                    name : doc.data().name,
                    surname : doc.data().surname,
                    sex : doc.data().sex,
                    businessName : doc.data().businessName,
                    brandName : doc.data().brandName,
                    address : doc.data().address,  
                    phoneNumber : doc.data().phoneNumber,
                    blockScreen : doc.data().blockScreen,
                    note : doc.data().note             
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
        console.log(data)
        var sfDocRef = db.collection("customer").doc(req.query.id);
        return db.runTransaction(function(transaction) {
            return transaction.get(sfDocRef).then(function(sfDoc) {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                    //throw "Document does not exist!";
                }       
                transaction.update(sfDocRef, { 
                    name : data.name,
                    surname : data.surname,
                    sex : data.sex,
                    businessName : data.businessName,
                    brandName : data.brandName,
                    address : data.address,  
                    phoneNumber : data.phoneNumber,
                    blockScreen : data.blockScreen,
                    note : data.note
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
    var docRef = db.collection('customer').doc();
    var setAda = docRef.set({       
        name : data.name,
        surname : data.surname,
        sex : data.sex,
        businessName : data.businessName,
        brandName : data.brandName,
        address : data.address,  
        phoneNumber : data.phoneNumber,
        blockScreen : data.blockScreen,
        note : data.note
    })
    res.status(200).send('Add complete');
});
app.delete('/',(req, res) => {
    db.collection("customer").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

module.exports = app