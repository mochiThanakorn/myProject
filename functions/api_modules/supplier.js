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

/*app.use((req, res, next) => {
    const userToken = req.header('userToken')
    if(typeof userToken !== 'undefined' && userToken !== '') {
        db.collection('employees').where('user.userToken', '==', userToken).get()
        .then((snapshot) => {
            if (snapshot.empty) {
                res.status(400).json({error: 'userToken not found in db.'})
            } else {
                snapshot.docs.forEach((doc) => {
                        if(doc.data().user.authority !== 'undefined' && doc.data().user.authority.manageSuppliers) {
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
})*/

const checkAuthority = (req, res, next) => {
  const userToken = req.header('userToken')
  if(typeof userToken !== 'undefined' && userToken !== '') {
      db.collection('employees').where('user.userToken', '==', userToken).get()
      .then((snapshot) => {
          if (snapshot.empty) {
              res.status(400).json({error: 'userToken not found in db.'})
          } else {
              snapshot.docs.forEach((doc) => {
                      if(doc.data().user.authority !== 'undefined' && doc.data().user.authority.manageSuppliers) {
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
}

app.get('/', (req, res) => {
    var employeeArr = []
    if(typeof req.query.id !== "undefined") {
        db.collection('supplier').doc(req.query.id).get()
        .then((doc) => {
            if (doc.exists) {
                res.json({
                    id : doc.id,
                    name : doc.data().name,
                    phoneNumber : doc.data().phoneNumber,
                    address : doc.data().address,
                    note : doc.data().note
                })
            } else {
                res.send("No such document!")
            }
        })
        .catch((err) => {
          res.status(401).send('Error getting documents', err)
        })
    }
    else if(typeof req.query.name !== "undefined") {
        db.collection('supplier').where('name', '==', req.query.name).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
                    id : doc.id,
                    name : doc.data().name,
                    phoneNumber : doc.data().phoneNumber,
                    address : doc.data().address,
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
        db.collection('supplier').orderBy("name").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
                    id : doc.id,
                    name : doc.data().name,
                    phoneNumber : doc.data().phoneNumber,
                    address : doc.data().address,
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

app.put('/', checkAuthority, (req, res) => {
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
        if(!data.name) {
            error_msg += "name,"
            error_chk = true
        }
        if(!data.phoneNumber) {
            error_msg += "phoneNumber,"
            error_chk = true
        }
        if(!data.address) {
            error_msg += "address,"
            error_chk = true
        }
        if(!data.note) {
            data.note = {}
        }
        if(error_chk) {
            error_msg += "]"
            res.status(400).json({msg:error_msg})
        }
        var sfDocRef = db.collection("supplier").doc(req.query.id);
        return db.runTransaction(function(transaction) {
            return transaction.get(sfDocRef).then(function(sfDoc) {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                    //throw "Document does not exist!";
                }
                transaction.update(sfDocRef, {
                    name : data.name,
                    phoneNumber : data.phoneNumber,
                    address : data.address,
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
app.post('/', checkAuthority, (req, res) => {
    // add feature console log check data when data is undefined
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
    if(!data.phoneNumber) {
        error_msg += "phoneNumber,"
        error_chk = true
    }
    if(!data.address) {
        error_msg += "address,"
        error_chk = true
    }
    if(!data.note) {
        data.note = {}
    }
    if(error_chk) {
        error_msg += "]"
        res.status(400).json({msg:error_msg})
    }
    var docRef = db.collection('supplier').doc();
    var setAda = docRef.set({
        name : data.name,
        phoneNumber : data.phoneNumber,
        address : data.address,
        note : data.note
    })
    res.status(200).send('Add complete');
});
app.delete('/', checkAuthority, (req, res) => {
    db.collection("supplier").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

module.exports = app
