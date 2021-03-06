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
const isValidFields = reqBody => {
    if(typeof reqBody == 'object') {
        var data = reqBody
    } else if(isJson(reqBody)) {
        var data = JSON.parse(reqBody)
    } else {
        return {
            status : 1,
            msg : "not json format",
            data : {}
        }
    }
    var error_msg = "Error no field ["
    var error_chk = false
    if(!data.name) {
        error_msg += "name,"
        error_chk = true
    }
    if(!data.code) {
        error_msg += "code,"
        error_chk = true
    }
    if(error_chk) {
        error_msg += "]"
        return {
            status : 2,
            msg : error_msg,
            data : {}
        }
    }
    return {
        status : 3,
        msg : "field are valid",
        data : data
    }
}

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
                            res.status(400).json({error: 'User can\'t use fabricRolls API.'})
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
        var obj = isValidFields(req.body)
        if(typeof req.body == 'object') {
            var data = req.body
        } else if(isJson(req.body)) {
            var data = JSON.parse(req.body)
        } else {
            res.status(400).json({msg:"not json format"})
        }
        var error_msg = "Error no field ["
        var error_chk = false
        if(!data.name) {
            error_msg += "name,"
            error_chk = true
        }
        if(!data.code) {
            error_msg += "code,"
            error_chk = true
        }
        if(error_chk) {
            error_msg += "]"
            res.status(400).json({msg:error_msg})
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
    var obj = isValidFields(req.body)
    if(typeof req.body == 'object') {
        var data = req.body
    } else if(isJson(req.body)) {
        var data = JSON.parse(req.body)
    } else {
        res.status(400).json({msg:"not json format"})
    }
    var error_msg = "Error no field ["
    var error_chk = false
    if(!data.name) {
        error_msg += "name,"
        error_chk = true
    }
    if(!data.code) {
        error_msg += "code,"
        error_chk = true
    }
    if(error_chk) {
        error_msg += "]"
        res.status(400).json({msg:error_msg})
    }
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