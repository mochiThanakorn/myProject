const express = require('express');
const app = express();
const db = require('./db_connect');

const isJson = str => {
    try {
        JSON.parse(str);
    } catch (err) {
        return false;
    }
    return true;
}
//middleware check authority of user
app.use((req, res, next) => {
    const userToken = req.header('userToken')
    if(typeof userToken !== 'undefined' && userToken !== '') {
        db.collection('employees').where('user.userToken', '==', userToken).get()
        .then((snapshot) => {
            if (snapshot.empty) {
                res.status(400).json({error: 'userToken not found in db.'})
            } else {
                snapshot.docs.forEach((doc) => {
                        if(doc.data().user.authority !== 'undefined' && doc.data().user.authority.manageFabrics) {
                            next()
                        } else {
                            res.status(400).json({error: 'User can\'t use fabricUse API.'})
                        }
                })
            }
        })
        .catch((err) => {
            res.status(400).json({error: err})
        })
    } else {
        res.status(400).json({error: 'There are not userToken.'})
    }
})

app.get('/',(req, res) => {
  let arr = []
        if(typeof req.query.id !== "undefined") {
            db.collection('fabricUse').where('id', '==', req.query.id).get()
            .then((snapshot) => {
                snapshot.docs.forEach((doc) => {
                    arr.push({
                        id : doc.id,
                        date: doc.data().date,
                        empCut: doc.data().empCut,
                        empSpread: doc.data().empSpread,
                        tableNum: doc.data().tableNum,
                        markNum: doc.data().markNum,
                        bags: doc.data().bags
                    })
                })
                res.status(200).send(arr);
            })
            .catch((err) => {
                res.status(401).json({error:err});
            })
        }
        else {
            var fabricUseArr = [];
            db.collection('fabricUse').orderBy("date").get()
            .then((snapshot) => {
                snapshot.docs.forEach((doc) => {
                    employeeArr.push({
                      id : doc.id,
                      date: doc.data().date,
                      empCut: doc.data().empCut,
                      empSpread: doc.data().empSpread,
                      tableNum: doc.data().tableNum,
                      markNum: doc.data().markNum,
                      bags: doc.data().bags

                    })
                })
                res.status(200).send(employeeArr);
            })
            .catch((err) => {
                res.status(401).json({error:err});
            });
        }
})

app.put('/',(req, res) => {
    if(typeof req.query.id !== "undefined") {
        if(typeof req.body == 'object') {
            var data = req.body
        } else if(isJson(req.body)) {
            var data = JSON.parse(req.body)
        } else {
            res.status(400).json({msg:"not json format"})
        }
        var error_msg = "Error no field ["
        var error_chk = false
        if(!data.date) {
            error_msg += "date,"
            error_chk = true
        }
        if(!data.empCut) {
            error_msg += "empCut,"
            error_chk = true
        }
        if(!data.empSpread) {
            error_msg += "empSpread,"
            error_chk = true
        }
        if(!data.tableNum) {
            error_msg += "tableNum,"
            error_chk = true
        }
        if(!data.markNum) {
            error_msg += "markNum,"
            error_chk = true
        }
        if(!data.bags) {
            error_msg += "bags,"
            error_chk = true
        }
        if(error_chk) {
            error_msg += "]"
            res.status(400).json({msg:error_msg})
        }
        var sfDocRef = db.collection("fabricUse").doc(req.query.id);
        return db.runTransaction(function(transaction) {
            return transaction.get(sfDocRef).then(function(sfDoc) {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                    //throw "Document does not exist!";
                }
                transaction.update(sfDocRef, data);
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
})
app.post('/',(req, res) => {
    if(typeof req.body == 'object') {
        var data = req.body
    } else if(isJson(req.body)) {
        var data = JSON.parse(req.body)
    } else {
        res.status(400).json({msg:"not json format"})
    }
    var error_msg = "Error no field ["
    var error_chk = false
    if(!data.date) {
        error_msg += "date,"
        error_chk = true
    }
    if(!data.empCut) {
        error_msg += "empCut,"
        error_chk = true
    }
    if(!data.empSpread) {
        error_msg += "empSpread,"
        error_chk = true
    }
    if(!data.tableNum) {
        error_msg += "tableNum,"
        error_chk = true
    }
    if(!data.markNum) {
        error_msg += "markNum,"
        error_chk = true
    }
    if(!data.bags) {
        error_msg += "bags,"
        error_chk = true
    }
    if(error_chk) {
        error_msg += "]"
        res.status(400).json({msg:error_msg})
    }
    db.collection('fabricUse').doc().set(data)
    res.status(200).send('Add fabricUse successful.');
})

app.delete('/',(req, res) => {
    db.collection("fabricUse").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

module.exports = app
