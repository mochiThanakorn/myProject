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
            msg : "not json format"
        }
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
    if(!data.sex) {
        error_msg += "sex,"
        error_chk = true
    }
    if(!data.businessName) {
        error_msg += "businessName,"
        error_chk = true
    }
    if(!data.brandName) {
        error_msg += "brandName,"
        error_chk = true
    }
    if(!data.address) {
        error_msg += "address,"
        error_chk = true
    }
    if(!data.phoneNumber) {
        error_msg += "phoneNumber,"
        error_chk = true
    }
    if(!data.note) {
        error_msg += "note,"
        error_chk = true
    }
    if(error_chk) {
        error_msg += "]"
        return {
            status : 2,
            msg : error_msg
        }
    }
    if(!data.blockScreen) {
        data.blockScreen = {}
    }
    return {
        status : 3,
        msg : "field are valid"
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
                        if(doc.data().user.authority !== 'undefined' && doc.data().user.authority.manageCustomers) {
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
        if(!data.sex) {
            error_msg += "sex,"
            error_chk = true
        }
        if(!data.businessName) {
            error_msg += "businessName,"
            error_chk = true
        }
        if(!data.brandName) {
            error_msg += "brandName,"
            error_chk = true
        }
        if(!data.address) {
            error_msg += "address,"
            error_chk = true
        }
        if(!data.phoneNumber) {
            error_msg += "phoneNumber,"
            error_chk = true
        }
        if(!data.note) {
            error_msg += "note,"
            error_chk = true
        }
        if(!data.blockScreen) {
            data.blockScreen = {}
        }
        if(error_chk) {
            error_msg += "]"
            res.status(400).json({msg:error_msg})
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
    if(!data.sex) {
        error_msg += "sex,"
        error_chk = true
    }
    if(!data.businessName) {
        error_msg += "businessName,"
        error_chk = true
    }
    if(!data.brandName) {
        error_msg += "brandName,"
        error_chk = true
    }
    if(!data.address) {
        error_msg += "address,"
        error_chk = true
    }
    if(!data.phoneNumber) {
        error_msg += "phoneNumber,"
        error_chk = true
    }
    if(!data.note) {
        error_msg += "note,"
        error_chk = true
    }
    if(!data.blockScreen) {
        data.blockScreen = {}
    }
    if(error_chk) {
        error_msg += "]"
        res.status(400).json({msg:error_msg})
    }
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

//block screen
app.get('/blockscreen',(req, res) => {
  let blockScreens = []
  if (req.query.id) {
    db.collection('customer').doc(req.query.id).get()
    .then((doc) => {
          for(let i = 0 ; doc.data().blockScreen[i] ; i++) {
            blockScreens.push({
              id : doc.id,
              name : doc.data().name,
              surname : doc.data().surname,
              businessName : doc.data().businessName,
              brandName : doc.data().brandName,
              blockScreenName: doc.data().blockScreen[i].name,
              dateAdd: doc.data().blockScreen[i].dateAdd,
              fileName: doc.data().blockScreen[i].fileName
            })
          }
        res.status(200).send(blockScreens);
    })
    .catch((err) => {
      console.log(err)
      res.status(401).json({error: err});
    })
  } else {
    db.collection('customer').where('numBlockScreen','>',0).get()
    .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          for(let i = 0 ; doc.data().blockScreen[i] ; i++) {
            blockScreens.push({
              id : doc.id,
              name : doc.data().name,
              surname : doc.data().surname,
              businessName : doc.data().businessName,
              brandName : doc.data().brandName,
              blockScreenName: doc.data().blockScreen[i].name,
              dateAdd: doc.data().blockScreen[i].dateAdd,
              fileName: doc.data().blockScreen[i].fileName
            })
          }
        })
        res.status(200).send(blockScreens);
    })
    .catch((err) => {
      console.log(err)
      res.status(401).json({error: err});
    })
  }
})

//add block screen to customer by id
app.post('/blockscreen',(req, res) => {
    if(!req.query.id) {
      res.status(400).json({msg:"There are no id"})
    }
    if(typeof req.body == 'object') {
        var data = req.body
    } else if(isJson(req.body)) {
        var data = JSON.parse(req.body)
    } else {
        res.status(400).json({msg:"not json format"})
    }

    console.log('Validation')
    //Validation
    var error_msg = "Error no field ["
    var error_chk = false
    if(!data.name) {
        error_msg += "name,"
        error_chk = true
    }
    if(!data.fileName) {
        error_msg += "fileName,"
        error_chk = true
    }
    if(!data.dateAdd) {
      error_msg += "dateAdd,"
      error_chk = true
    }
    if(error_chk) {
        error_msg += "]"
        res.status(400).json({msg:error_msg})
    }
    /*console.log('check block screen name and File name is\'t already taken')
    //check block screen name and File name is't already taken
    db.collection('customer').get()
    .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          for(let i = 0 ; doc.data().blockScreen[i] ; i++) {
            console.log('Check : '+doc.data().blockScreen[i].name+" == "+data.name)
            if(doc.data().blockScreen[i].name == data.name) {
              console.log('Block screen name is aready taken!')
              res.status(400).send('Block screen name is aready taken!')
            } else if(doc.data().blockScreen[i].fileName == data.fileName) {
              console.log('File name is aready taken!')
              res.status(400).send('File name is aready taken!')
            }
          }
        }).then(() => {
          console.log('foreach finish.')
          console.log('Add database')
          //Add database
          var sfDocRef = db.collection("customer").doc(req.query.id);
          return db.runTransaction((transaction) => {
              return transaction.get(sfDocRef).then((sfDoc) => {
                  if (!sfDoc.exists) {
                      res.status(400).json({error : "Document does not exist!"})
                  }

                  //create block screen json
                  let blockScreen = {
                    name: data.name,
                    fileName: data.fileName,
                    dateAdd: data.dateAdd
                  }
                  let blockScreens = []
                  if(sfDoc.data().blockScreen.length > 0)
                    blockScreens.push(...sfDoc.data().blockScreen)
                  blockScreens.push(blockScreen)

                  transaction.update(sfDocRef, {
                      numBlockScreen: sfDoc.data().numBlockScreen + 1,
                      blockScreen : blockScreens
                  })
              })
          }).then(() => {
              res.status(200).send("Add block screen successful.")
          }).catch((err) => {
              res.status(400).send(err)
          })
          //
        }).catch((err) => {
          res.status(402).send(err)
        })
    })
    .catch((err) => {
        res.status(401).send(err)
    })*/

    console.log('Add database')
    //Add database
    var sfDocRef = db.collection("customer").doc(req.query.id);
    return db.runTransaction((transaction) => {
        return transaction.get(sfDocRef).then((sfDoc) => {
            if (!sfDoc.exists) {
                res.status(400).json({error : "Document does not exist!"})
            }

            //create block screen json
            let blockScreen = {
              name: data.name,
              fileName: data.fileName,
              dateAdd: data.dateAdd
            }
            let blockScreens = []
            if(sfDoc.data().blockScreen.length > 0)
              blockScreens.push(...sfDoc.data().blockScreen)
            blockScreens.push(blockScreen)

            transaction.update(sfDocRef, {
                numBlockScreen: sfDoc.data().numBlockScreen + 1,
                blockScreen : blockScreens
            })
        })
    }).then(() => {
        res.status(200).send("Add block screen successful.")
    }).catch((errorMsg) => {
        res.status(401).json({
          error : errorMsg
        })
    })
})

module.exports = app
