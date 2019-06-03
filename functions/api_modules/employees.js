const express = require('express');
const app = express();
const db = require('./db_connect');
const firebase = require('firebase-admin');
const randomToken = require('random-token');

//functions check is a valid json
const isJson = str => {
    try {
        JSON.parse(str);
    } catch (err) {
        return false;
    }
    return true;
} 

app.get('/test',(req, res) => {
    var token = randomToken(16)
    console.log(token)
    var token2 = randomToken(32)
    console.log(token2)
    let str = token + " " + token2
    res.send(str)   
})


app.use("/", (req, res, next) => {
    const userToken = req.header('userToken')
    if(typeof userToken !== 'undefined' && userToken !== '') {
        db.collection('employees').where('user.userToken', '==', userToken).get()
        .then((snapshot) => {
            if (snapshot.empty) {
                res.status(400).json({error: 'userToken not found in db.'})
            } else {
                snapshot.docs.forEach((doc) => {
                    if(doc.data().user.authority !== 'undefined') {
                        if(doc.data().user.authority.manageEmployees) {
                            next()
                            console.log("doc.data().user.authority.manageEmployees = "+doc.data().user.authority.manageEmployees)
                        } else if((doc.data().user.authority.manageUsers || doc.data().user.authority.manageFabricUse) && req.method === "GET") {
                            next()
                            console.log("doc.data().user.authority.manageUsers = "+doc.data().user.authority.manageUsers+"doc.data().user.authority.manageFabricUse = "+doc.data().user.authority.manageFabricUse)
                        } else if(req.path == "/chgpwd") {
                            console.log("req.path = "+req.path)
                            next()
                        } else {
                            res.status(400).json({
                                error: 'User can\'t use Employee API.'
                            })
                        }
                    } else {
                        res.status(400).json({
                            error: 'Authority is "undefined"'
                        })
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


app.put('/chgpwd', (req, res) => {
    console.log("/chgpwd")
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
        if(!data.password) {
            error_msg += "password"
            error_chk = true
        }
        if(error_chk) {
            error_msg += "]"
            res.status(400).json({msg: error_msg})
        }
        var sfDocRef = db.collection("employees").doc(req.query.id)
        return db.runTransaction(function(transaction) {
            return transaction.get(sfDocRef).then((sfDoc) => {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                }
                if(req.header('userToken') === sfDoc.data().user.userToken) {
                    let user = sfDoc.data().user
                    user.password = data.password
                    transaction.update(sfDocRef, {
                        user : user
                    })
                } else {
                    res.status(400).json({error : "Permission denied!"})
                }            
            })
        }).then(function() {
            res.status(200).send("Transaction successfully committed!")
        }).catch(function(errorMsg) {
            res.status(400).json({error : errorMsg})
        })
    }
    else {
        res.send(400).send("not found id")
    }
})

//get employee
app.get('/',(req, res) => {
    var data = []
    db.collection('employees').orderBy('name').orderBy('surname').get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                    let isUserVal;
                    if(doc.data().user) {
                        isUserVal = true;
                    } else {
                        isUserVal = false;
                    }
                    data.push({
                        id : doc.id,
                        name : doc.data().name,
                        surname : doc.data().surname,
                        sex : doc.data().sex,
                        birthday : doc.data().birthday,
                        position : doc.data().position,
                        address : doc.data().address,
                        phoneNumber : doc.data().phoneNumber,
                        firstDayOfWork : doc.data().firstDayOfWork,
                        isUser : isUserVal
                    })            
            });
            res.status(200).send(data);
        })
        .catch((err) => {
            console.log("Error to get all employees.")
            res.status(401).json({msg : err});
        });
})

//get employee who is user
app.get('/isuser',(req, res) => {
    var data = []
    db.collection('employees').get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(doc.data().user) {
                    data.push({
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
                }             
            })
            res.status(200).send(data);
        })
        .catch((err) => {
            console.log("Error to get employee who is user.")
            res.status(401).json({msg : err});
        });
})

//get employee who is't user
app.get('/isnotuser',(req, res) => {
    var data = []
    db.collection('employees').get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(!doc.data().user) {
                    data.push({
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
                }             
            });
            res.status(200).send(data);
        })
        .catch((err) => {
            console.log("Error to employee who is't user.")
            res.status(401).json({msg : err});
        });
})

//add employee
app.post('/',(req, res) => {
    if(typeof req.body == 'object') {
        var data = req.body
    } else if(isJson(req.body)) {
        var data = JSON.parse(req.body)
    } else {
        res.status(400).json({msg:"not json format"})
    }
    db.collection('employees').doc().set({       
        name: data.name,
        surname: data.surname,
        sex: data.sex,
        birthday: data.birthday,
        position: data.position,
        address: data.address,
        phoneNumber: data.phoneNumber,
        firstDayOfWork: data.firstDayOfWork 
    })
    res.status(200).json({msg:'Successfully added.'});
})

//update employee
app.put('/',(req, res) => {
    if(typeof req.query.id !== "undefined" && req.query.id != "") {
        if(typeof req.body == 'object') {
            var user = req.body
        } 
        else {
            var user = JSON.parse(req.body)
        }
        var sfDocRef = db.collection("employees").doc(req.query.id);
        return db.runTransaction((transaction)=>{
            return transaction.get(sfDocRef).then((sfDoc)=>{
                if (!sfDoc.exists) {
                    res.status(404).json({msg : "Document does not exist!"})
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
                })
            })
        }).then(() => {
            res.status(200).json({msg : "Successfully updated."})
        }).catch((err) => {
            res.status(401).json({msg : err})
        });
    }
    else {
        res.send(401).json({msg : "not found id"})
    }
});

//delete employee
app.delete('/',(req, res) => {
    db.collection("employees").doc(req.query.id).delete().then(()=>{
        res.status(200).send("Document successfully deleted!")
    }).catch((err)=>{
        res.status(401).send("Error removing document: ", err)
    });
});

//user
//get all user
app.get('/user',(req, res) => {
    var data = []
    db.collection('employees').get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(doc.data().user) {
                    data.push({
                        id : doc.id,
                        userToken: doc.data().user.userToken,
                        username : doc.data().user.username,
                        //password : doc.data().user.password,
                        registerDate : doc.data().user.registerDate,
                        authority : doc.data().user.authority                 
                    })
                }           
            })
            res.status(200).send(data);
        })
        .catch((err) => {
            console.log("Error to get all employees.")
            res.status(401).json({msg : err});
        });
})

//add user to employee
app.post('/user',(req, res) => {
    if(typeof req.query.id !== "undefined" && req.query.id != "") {
        if(typeof req.body == 'object') {
            var data = req.body
        } 
        else {
            var data = JSON.parse(req.body)
        }
        var sfDocRef = db.collection("employees").doc(req.query.id);
        return db.runTransaction((transaction)=>{
            return transaction.get(sfDocRef).then((sfDoc)=>{
                if (!sfDoc.exists) {
                    res.status(404).json({msg : "Document does not exist!"})
                }
                var usn,pwd,auth,regis            
                if(data.username) {
                    console.log("h username")
                    usn = data.username
                } else {
                    console.log("n username")
                    usn = sfDoc.data().user.username
                }
                if(data.password) {
                    pwd = data.password
                } else {
                    pwd = sfDoc.data().user.password
                }
                if(data.authority) {
                    auth = data.authority
                } else {
                    auth = sfDoc.data().user.authority
                } 
                if(data.registerDate) {
                    regis = data.registerDate
                } else {
                    regis = sfDoc.data().user.registerDate
                }                      
                transaction.update(sfDocRef, { 
                    user : {
                        username: usn,
                        password: pwd,
                        authority: auth,
                        registerDate: regis,
                        userToken: randomToken(32)
                    }
                })       
            })
        }).then(() => {
            res.status(200).json({msg : "Successfully updated."})
        }).catch((err) => {
            res.status(401).json({msg : err})
        })
    }
    else {
        res.send(401).json({msg : "not found id"})
    }
})

//update user 
app.put('/user',(req, res) => {
    if(typeof req.query.id !== "undefined" && req.query.id != "") {
        if(typeof req.body == 'object') {
            var data = req.body
        } 
        else {
            var data = JSON.parse(req.body)
        }
        var sfDocRef = db.collection("employees").doc(req.query.id);
        return db.runTransaction((transaction)=>{
            return transaction.get(sfDocRef).then((sfDoc)=>{
                if (!sfDoc.exists) {
                    res.status(404).json({msg : "Document does not exist!"})
                }
                var usn,pwd,auth,regis            
                if(data.username) {
                    usn = data.username
                } else {
                    usn = sfDoc.data().user.username
                }
                if(data.password) {
                    pwd = data.password
                } else {
                    pwd = sfDoc.data().user.password
                }
                if(data.authority) {
                    auth = data.authority
                } else {
                    auth = sfDoc.data().user.authority
                } 
                if(data.registerDate) {
                    regis = data.registerDate
                } else {
                    regis = sfDoc.data().user.registerDate
                }                      
                transaction.update(sfDocRef, { 
                    user : {
                        username : usn,
                        password : pwd,
                        authority : auth,
                        registerDate : regis,
                        userToken : sfDoc.data().user.userToken

                    }
                })       
            })
        }).then(() => {
            res.status(200).json({msg : "Successfully updated."})
        }).catch((err) => {
            res.status(401).json({msg : err})
        });
    }
    else {
        res.send(401).json({msg : "not found id"})
    }
})

//delete user
app.delete('/user',(req, res) => {
    if(typeof req.query.id !== "undefined" && req.query.id != "") {
        var sfDocRef = db.collection("employees").doc(req.query.id);
        return db.runTransaction((transaction)=>{
            return transaction.get(sfDocRef).then((sfDoc)=>{
                if (!sfDoc.exists) {
                    res.status(404).json({msg : "Document does not exist!"})
                }
                transaction.update(sfDocRef, { 
                    user : firebase.firestore.FieldValue.delete()
                })       
            })
        }).then(() => {
            res.status(200).json({msg : "Successfully delete."})
        }).catch((err) => {
            console.log(err)
            res.status(401).json({msg : err})
        });
    }
    else {
        res.send(401).json({msg : "not found id"})
    }
});

module.exports = app
