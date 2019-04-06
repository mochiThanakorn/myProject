const express = require('express');
const app = express();
const db = require('./db_connect');
const firebase = require('firebase-admin');
const randomToken = require('random-token');

const isJson = str => {
    try {
        JSON.parse(str);
    } catch (err) {
        return false;
    }
    return true;
}

const authToBool = (authority) => {
    let newAuthority = {
        "manageBlockScreen": "",
        "manageFabricUse": "",
        "manageOrder": "",
        "manageSuppliers": "",
        "manageCustomers": "",
        "manageUsers": "",
        "manageEmployees": "",
        "manageFabrics": ""
    }
    if(authority.manageBlockScreen == 'true') newAuthority.manageBlockScreen = true
    else newAuthority.manageBlockScreen = false
    if(authority.manageFabricUse == 'true') newAuthority.manageFabricUse = true
    else newAuthority.manageFabricUse = false
    if(authority.manageOrder == 'true') newAuthority.manageOrder = true
    else newAuthority.manageOrder = false
    if(authority.manageSuppliers == 'true') newAuthority.manageSuppliers = true
    else newAuthority.manageSuppliers = false
    if(authority.manageCustomers == 'true') newAuthority.manageCustomers = true
    else newAuthority.manageCustomers = false
    if(authority.manageUsers == 'true') newAuthority.manageUsers = true
    else newAuthority.manageUsers = false
    if(authority.manageEmployees == 'true') newAuthority.manageEmployees = true
    else newAuthority.manageEmployees = false
    if(authority.manageFabrics == 'true') newAuthority.manageFabrics = true
    else newAuthority.manageFabrics = false
    return newAuthority
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
                    if(doc.data().user.authority !== 'undefined' && doc.data().user.authority.manageUsers) {
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

//user
//get all user
app.get('/',(req, res) => {
    var data = []
    db.collection('employees').orderBy("name").orderBy('surname').get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(doc.data().user) {
                    data.push({
                        id : doc.id,
                        name: doc.data().name,
                        surname: doc.data().surname,
                        position: doc.data().position,
                        userToken: doc.data().user.userToken,
                        username : doc.data().user.username,
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
app.post('/',(req, res) => {
  if(typeof req.query.id !== "undefined" && req.query.id != "") {
      if(typeof req.body == 'object') {
          var data = req.body
      }
      else {
          var data = JSON.parse(req.body)
      }
      db.collection('employees').where('user.username', '==', data.username).get()
      .then((snapshot) => {
          if (snapshot.empty) {
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
                          auth = authToBool(data.authority)
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
                  console.log(err)
                  res.status(401).json({msg : err})
              })
          } else {
              res.status(400).json({error: 'Please change username.'})
          }
      })
      .catch((err) => {
          res.status(400).json({error: err})
      })
  }
  else {
      res.send(401).json({msg : "not found id"})
  }
})

//update user
app.put('/',(req, res) => {
  if(typeof req.query.id !== "undefined" && req.query.id != "") {
      if(typeof req.body == 'object') {
          var data = req.body
      }
      else {
          var data = JSON.parse(req.body)
      }
      console.log(data)
      var sfDocRef = db.collection("employees").doc(req.query.id);
        return db.runTransaction((transaction)=>{
          return transaction.get(sfDocRef)
          .then((sfDoc)=>{
            if (!sfDoc.exists) {
              res.status(404).json({msg : "Document does not exist!"})
            }
            console.log(data.username + ' = ' + sfDoc.data().user.username)
            if(data.username && sfDoc.data().user.username != data.username) {
              console.log('===')
              db.collection('employees').where('user.username', '==', data.username).get()
              .then((snapshot) => {
                if (!snapshot.empty) {
                  console.log('Username is already taken!')
                  res.status(400).json({error: 'Username is already taken!'})
                }
              })
              .catch((err) => {
                console.log(err)
                res.status(400).json({msg : err})
              })
            }
            var usn, pwd, auth, regis
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
                          auth = authToBool(data.authority)
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
                  console.log(err)
                  res.status(401).json({msg : err})
              })

  }
  else {
      res.send(401).json({msg : "not found id"})
  }
})
/*app.put('/',(req, res) => {
    if(typeof req.query.id !== "undefined" && req.query.id != "") {
        if(typeof req.body == 'object') {
            var data = req.body
        }
        else {
            var data = JSON.parse(req.body)
        }
        db.collection('employees').where('user.username', '==', data.username).get()
        .then((snapshot) => {
            console.log(snapshot[0].data().username)
            if (snapshot.empty) {
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
                            auth = authToBool(data.authority)
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
                    console.log(err)
                    res.status(401).json({msg : err})
                })
            } else {
                res.status(400).json({error: 'Please change username.'})
            }
        })
        .catch((err) => {
            res.status(400).json({error: err})
        })
    }
    else {
        res.send(401).json({msg : "not found id"})
    }
})*/

//delete user
app.delete('/',(req, res) => {
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
})




/*
//get user
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

app.put('/', (req, res) => {
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
        if(!data.username) {
            error_msg += "username,"
            error_chk = true
        }
        if(!data.password) {
            error_msg += "password,"
            error_chk = true
        }
        if(!data.idEmployee) {
            error_msg += "idEmployee,"
            error_chk = true
        }
        if(!data.name) {
            error_msg += "name,"
            error_chk = true
        }
        if(!data.surname) {
            error_msg += "surname,"
            error_chk = true
        }
        if(!data.registerDate) {
            error_msg += "registerDate,"
            error_chk = true
        }
        if(!data.authority) {
            data.authority = {}
        }
        if(error_chk) {
            error_msg += "]"
            res.status(400).json({msg:error_msg})
        }
        var sfDocRef = db.collection("users").doc(req.query.id);
        return db.runTransaction((transaction) => {
            return transaction.get(sfDocRef).then((sfDoc) => {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                }
                transaction.update(sfDocRef, {
                    username: data.username,
                    password: data.password,
                    idEmployee: data.idEmployee,
                    name: data.name,
                    surname: data.surname,
                    registerDate: data.registerDate,
                    authority: data.authority
                })
            })
        })
        .then(() => {
            res.status(200).send("Transaction successfully committed!")
        })
        .catch((err) => {
            res.status(401).json({error : err})
        })
    }
    else {
        res.send(401).send("not found id")
    }
})

app.put('/general', (req, res) => {
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
        if(!data.username) {
            error_msg += "username,"
            error_chk = true
        }
        if(!data.idEmployee) {
            error_msg += "idEmployee,"
            error_chk = true
        }
        if(!data.name) {
            error_msg += "name,"
            error_chk = true
        }
        if(!data.surname) {
            error_msg += "surname,"
            error_chk = true
        }
        if(!data.registerDate) {
            error_msg += "registerDate,"
            error_chk = true
        }
        if(!data.authority) {
            data.authority = {}
        }
        if(error_chk) {
            error_msg += "]"
            res.status(400).json({msg:error_msg})
        }
        var sfDocRef = db.collection("users").doc(req.query.id);
        return db.runTransaction((transaction) => {
            return transaction.get(sfDocRef).then((sfDoc) => {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                }
                transaction.update(sfDocRef, {
                    username: data.username,
                    idEmployee: data.idEmployee,
                    name: data.name,
                    surname: data.surname,
                    registerDate: data.registerDate,
                    authority: data.authority
                })
            })
        })
        .then(() => {
            res.status(200).send("Transaction successfully committed!")
        })
        .catch((err) => {
            res.status(401).json({error : err})
        })
    }
    else {
        res.send(401).send("not found id")
    }
})

app.put('/pwd', (req, res) => {
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
            error_msg += "password,"
            error_chk = true
        }
        if(error_chk) {
            error_msg += "]"
            res.status(400).json({msg:error_msg})
        }
        var sfDocRef = db.collection("users").doc(req.query.id);
        return db.runTransaction((transaction) => {
            return transaction.get(sfDocRef).then((sfDoc) => {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                }
                transaction.update(sfDocRef, {
                    password: data.password
                })
            })
        })
        .then(() => {
            res.status(200).send("Transaction successfully committed!")
        })
        .catch((err) => {
            res.status(401).json({error : err})
        })
    }
    else {
        res.send(401).send("not found id")
    }
})

app.post('/', (req, res) => {
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
    if(!data.surname) {
        error_msg += "surname,"
        error_chk = true
    }
    if(!data.idEmployee) {
        error_msg += "idEmployee,"
        error_chk = true
    }
    if(!data.username) {
        error_msg += "username,"
        error_chk = true
    }
    if(!data.password) {
        error_msg += "password,"
        error_chk = true
    }
    if(!data.registerDate) {
        error_msg += "registerDate,"
        error_chk = true
    }
    if(!data.authority) {
        data.authority = {}
    }
    if(error_chk) {
        error_msg += "]"
        res.status(400).json({msg:error_msg})
    }
    db.collection('users').doc().set({
        username: data.username,
        password: data.password,
        idEmployee: data.idEmployee,
        name: data.name,
        surname: data.surname,
        registerDate: data.registerDate,
        authority: data.authority
    })
    res.status(200).send('Add user successful.');
});
app.delete('/',(req, res) => {
    db.collection("users").doc(req.query.id).delete().then(function() {
        console.log("Delete success")
        res.status(200).send("Document successfully deleted!");
    }).catch(function(err) {
        console.log(err)
        res.status(401).send("Error removing document: ", err);
    });
});*/

//save
/*app.post('/',(req, res) => {
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
                    auth = authToBool(data.authority)
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
            console.log(err)
            res.status(401).json({msg : err})
        })
    }
    else {
        res.send(401).json({msg : "not found id"})
    }
})*/

module.exports = app

//backup
/*app.post('/',(req, res) => {
    if(typeof req.query.id !== "undefined" && req.query.id != "") {
        if(typeof req.body == 'object') {
            var data = req.body
        }
        else {
            var data = JSON.parse(req.body)
        }
        db.collection('employees').where('user.username', '==', data.username).get()
        .then((snapshot) => {
            if (snapshot.empty) {
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
                            auth = authToBool(data.authority)
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
                    console.log(err)
                    res.status(401).json({msg : err})
                })
            } else {
                res.status(400).json({error: 'Please change username.'})
            }
        })
        .catch((err) => {
            res.status(400).json({error: err})
        })
    }
    else {
        res.send(401).json({msg : "not found id"})
    }
})*/
