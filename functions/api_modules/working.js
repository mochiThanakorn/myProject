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

app.get('/',(req, res) => {
    if(typeof req.query.id !== "undefined") {
        db.collection('working').doc(req.query.id).get()
        .then((doc) => {
            if (doc.exists) {
                res.json({
                    id : doc.id,
                    date: doc.data().date,
                    empCut: doc.data().empCut,
                    empSpread: doc.data().empSpread,
                    tableNum: doc.data().tableNum,
                    markNum: doc.data().markNum,
                    fabricRolls: doc.data().fabricRolls
                })
            } else {
                res.send("No such document!")
            }
        })
    .catch((err) => {
        res.status(401).send('Error getting documents', err)
    })
    }
    else {
      var data = []
      db.collection('working').get()
      .then((snapshot) => {
          snapshot.docs.forEach((doc) => {
              data.push({
                  id : doc.id,
                  date: doc.data().date,
                  empCut: doc.data().empCut,
                  empSpread: doc.data().empSpread,
                  tableNum: doc.data().tableNum,
                  markNum: doc.data().markNum,
                  fabricRolls: doc.data().fabricRolls
              })
          })
          res.status(200).send(data);
      })
      .catch((err) => {
          res.status(401).json({error:err});
      })
  }
})

const getAndUpdateIdBag = () => {
  return new Promise ((resolve, reject) => {
    db.collection("bagCount").doc("count").get()
    .then((doc) => {
      if (doc.exists) {
        var idBag = doc.data().number
        var batch = db.batch()
        var bagCountRef = db.collection("bagCount").doc("count")
        batch.set(bagCountRef, {number: idBag + 1})
        batch.commit().then(() => {
          resolve(idBag)
        })
        .catch((err) => {
          console.log(err)
          resolve(false)
        })
      } else {
        console.log("No such document!")
        resolve(false)
      }
    })
  })
}

const getIdBag = () => {
  return new Promise ((resolve, reject) => {
    db.collection("bagCount").doc("count").get()
    .then((doc) => {
      if (doc.exists) {
        var idBag = doc.data().number
        resolve(idBag)
      } else {
        console.log("No such document!")
        resolve(false)
      }
    })
  })
}

app.get('/idbag', async (req, res) => {
  let idBag = await getIdBag()
  res.status(200).send(""+idBag)
})



app.put('/fabricrolls',(req, res) => {
    if(typeof req.query.id !== "undefined") {
        if(typeof req.body == 'object') {
            var data = req.body
        } else if(isJson(req.body)) {
            var data = JSON.parse(req.body)
        } else {
            res.status(400).json({msg: "not json format"})
        }
        var error_msg = "Error no field ["
        var error_chk = false
        if(!data.fabricRolls) {
            error_msg += "idFabricRoll,"
            error_chk = true
        }
        if(error_chk) {
            error_msg += "]"
            res.status(400).json({msg: error_msg})
        }
        var workingRef = db.collection("working").doc(req.query.id);
        return db.runTransaction((transaction) => {
            return transaction.get(workingRef).then((workingDoc) => {
                if (!workingDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                }
                transaction.update(workingRef, {
                    fabricRolls: data.fabricRolls
                })
            })
        }).then(() => {
            res.status(200).send("Transaction successfully committed!")
        }).catch((errorMsg) => {
            res.status(401).json({error : errorMsg})
        })
      } else {
        res.status(400).json({msg: "There are no id working"})
      }
})

/*const IsUseOrScanFabricRolls = (id) => {
  console.log('IsUseOrScanFabricRolls')
  return new Promise ((resolve, reject) => {
    var sfDocRef = db.collection("fabricRoll").doc(id);
    db.runTransaction((transaction) => {
        transaction.get(sfDocRef).then((sfDoc) => {
            if (!sfDoc.exists) {
              resolve({err: "Document does not exist!"})
            }
            if (sfDoc.data().status == 'scan') {
              resolve({
                status: 1,
                msg: 'This fabric already scan.'
              })
            } else if (sfDoc.data().status == 'use') {
              resolve({
                status: 2,
                msg: 'This fabric already use.'
              })

            } else {
              transaction.update(sfDocRef, {
                  status : 'scan'
              })
            }
        })
    }).then(() => {
      resolve({msg:"Update status fabric roll to scan successful."})
    }).catch((err) => {
      reject(err)
    })
  })
}*/
const test1 = id => {
  var sfDocRef = db.collection("fabricRoll").doc(id);
  return db.runTransaction(function(transaction) {
      // This code may get re-run multiple times if there are conflicts.
      return transaction.get(sfDocRef).then(function(sfDoc) {
          if (!sfDoc.exists) {
              throw "Document does not exist!";
          }
          if (sfDoc.data().status == 'scan') {
            console.log('This fabric already scan.')
            resolve('This fabric already scan.')
          } else if (sfDoc.data().status == 'use') {
            console.log('This fabric already scan.')
            resolve('This fabric already scan.')
          }
          //var newPopulation = sfDoc.data().population + 1;
          transaction.update(sfDocRef, { population: newPopulation });
      });
  }).then(function() {
      console.log("Transaction successfully committed!");
  }).catch(function(error) {
      console.log("Transaction failed: ", error);
  });
}
const IsUseOrScanFabricRolls = async (id) => {
  let sfDocRef = db.collection("fabricRoll").doc(id)
  try {
    await db.runTransaction(async (transaction) => {
      let doc = await transaction.get(sfDocRef)
      if(!doc.exists) {
        console.log('doc not found.')
        reject('doc not found.')
      }
      transaction.update(sfDocRef, {
        status: 'scan'
      })
      console.log('IsUseOrScanFabricRolls successful')
      return true
    })
  }
  catch (err) {
    console.log(err)
    return false
  }



  /*console.log('function start 1')
  return new Promise ((resolve, reject) => {
    var sfDocRef = db.collection("fabricRoll").doc(id);
    db.runTransaction((transaction) => {
      console.log('go')
        await transaction.get(sfDocRef).then((sfDoc) => {
          console.log('hello')
            if (!sfDoc.exists) {
              console.log('There are no data.')
              resolve('Document does not exist!')
            }
            if (sfDoc.data().status == 'scan') {
              console.log('This fabric already scan.')
              resolve('This fabric already scan.')
            } else if (sfDoc.data().status == 'use') {
              console.log('This fabric already scan.')
              resolve('This fabric already scan.')
            }
              console.log('transaction.update')
              transaction.update(sfDocRef, {
                  status : 'scan'
              })
              resolve(true)
        }).catch((err) => {
          console.log(err)
          reject(err)
        })
        resolve('olo')
    }).then(() => {
      console.log('Update status fabric roll to scan successful.')
      resolve('Update status fabric roll to scan successful.')
    }).catch((err) => {
      console.log(err)
      reject(err)
    })
  })*/
}
app.put('/test',async (req, res) => {

  if(typeof req.body == 'object') {
      var data = req.body
  } else if(isJson(req.body)) {
      var data = JSON.parse(req.body)
  } else {
      res.status(400).json({msg:"not json format"})
  }
  console.log(data.idFabricRoll)
  let t = await test1(data.idFabricRoll)
  console.log('t = ' + t)
  let result = await IsUseOrScanFabricRolls(data.idFabricRoll)
  console.log('result = '+result)
  if(result) {
    console.log(true)
    res.status(200).send(result)
  } else {
    console.log(false)
    res.status(400).send(result)
  }
})
//function
const updateStatusFabricRoll = (id) => {
  var docRef = db.collection('fabricRoll').doc(id)
  var transaction = db.runTransaction(t => {
    return t.get(docRef).then(doc => {
        var status = doc.data().status
        if (status == 'wait') {
          t.update(docRef, {status: 'scan'})
          //console.log('update status of fabric roll success')
          return Promise.resolve({
            status: 1,
            data: {
              id: doc.id,
              data: doc.data()
            }
          })
        } else if (status == 'scan')  {
          t.update(docRef, {status: 'scan'})
          //console.log('error: fabric roll is already scan')
          return Promise.resolve({
            status: 2,
            data: {
              id: doc.id,
              data: doc.data()
            }
          })
        } else if (status == 'use')  {
          t.update(docRef, {status: 'use'})
          //console.log('error: fabric roll is already use')
          return Promise.resolve({
            status: 3,
            data: {
              id: doc.id,
              data: doc.data()
            }
          })
        }
      })
  })
  return transaction
}
const addFabricRollToWorking = (idWorking, fabricRoll) => {
  var docRef = db.collection('working').doc(idWorking)
  var transaction = db.runTransaction(t => {
    return t.get(docRef).then(doc => {
      var newFabricRoll = {
        id: fabricRoll.id,
        ColorCode: fabricRoll.data.fabricColorCode,
        ColorName: fabricRoll.data.fabricColor,
        TypeName: fabricRoll.data.fabricType,
        idFabric: fabricRoll.data.idFabric,
        size: fabricRoll.data.size,
        weight: fabricRoll.data.weight,
        level: 0,
        idBag: ""
      }
      t.update(docRef, {
        fabricRolls: [...doc.data().fabricRolls, newFabricRoll]
      })
      //console.log('update status of fabric roll success')
      return Promise.resolve({
        status: 'ok'
      })
    })
  })
  return transaction
}


app.put('/scan', async (req, res) => {
    if(typeof req.query.id == "undefined") {
      res.status(400).json({msg: "req.query.id = undefined"})
    }
        if(typeof req.body == 'object') {
            var data = req.body
        } else if(isJson(req.body)) {
            var data = JSON.parse(req.body)
        } else {
            res.status(400).json({msg: "not json format"})
        }
        var error_msg = "Error no field ["
        var error_chk = false
        if(!data.idFabricRoll) {
            error_msg += "idFabricRoll,"
            error_chk = true
        }
        if(error_chk) {
            error_msg += "]"
            res.status(400).json({msg: error_msg})
        }

        //พัง
        /*console.log('do func')
        let result = await IsUseOrScanFabricRolls(data.idFabricRoll)
        if(result) {
          console.log(200)
          res.status(200).send(result)
        } else {
          console.log(400)
          res.status(400).send(result)
        }*/

        var result = await updateStatusFabricRoll(data.idFabricRoll)
        console.log(result.status)
        if(result.status != 1) {
          res.status(200).json({
            status: result.status
          })
        } else {
          var fabricRollRef = db.collection("fabricRoll").doc(data.idFabricRoll);
          return db.runTransaction((transaction) => {
              return transaction.get(fabricRollRef).then((fabricRollDoc) => {
                  if (!fabricRollDoc.exists) {
                      res.status(404).json({error : "Document does not exist!"})
                  }
                  var workingRef = db.collection("working").doc(req.query.id);
                  return db.runTransaction((transaction) => {
                      return transaction.get(workingRef).then((workingDoc) => {
                          if (!workingDoc.exists) {
                              res.status(404).json({error : "Document does not exist!"})
                          }
                          let fabricRoll = {
                            id: fabricRollDoc.id,
                            idFabric: fabricRollDoc.data().idFabric,
                            ColorName: fabricRollDoc.data().fabricColor,
                            ColorCode: fabricRollDoc.data().fabricColorCode,
                            TypeName: fabricRollDoc.data().fabricType,
                            size: fabricRollDoc.data().size,
                            weight: fabricRollDoc.data().weight,
                            level: 0,
                            idBag: ""
                          }
                          var new_fabricRolls = [...workingDoc.data().fabricRolls, fabricRoll]
                          transaction.update(workingRef, {
                              fabricRolls: new_fabricRolls
                          })
                      })
                  }).then(() => {
                      res.status(200).send({
                        status: result.status
                      })
                  }).catch((errorMsg) => {
                      res.status(401).json({error : errorMsg})
                  })
              })
          }).then(() => {
              res.status(200).send({
                status: result.status
              })
          }).catch((errorMsg) => {
              res.status(401).json({error : errorMsg})
          })
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
        if(!data.state) {
            error_msg += "state,"
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
        if(error_chk) {
            error_msg += "]"
            res.status(400).json({msg: error_msg})
        }
        var sfDocRef = db.collection("working").doc(req.query.id)
        return db.runTransaction((transaction) => {
            return transaction.get(sfDocRef).then((sfDoc) => {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                }
                transaction.update(sfDocRef, data)
            })
        }).then(() => {
            res.status(200).send("Transaction successfully committed!")
        }).catch((errorMsg) => {
            res.status(401).json({error : errorMsg})
        })
    }
    else {
        res.send(401).send("not found id")
    }
})

//finish
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
    if(error_chk) {
        error_msg += "]"
        res.status(400).json({msg: error_msg})
    }
    let doc = db.collection('working').doc()
    doc.set({
        date: data.date,
        state: 1,
        empCut: data.empCut,
        empSpread: data.empSpread,
        tableNum: data.tableNum,
        markNum: data.markNum,
        fabricRolls: []
    })
    .then(() => {
      console.log(doc.id)
      res.status(200).send(doc.id)
    })

})

app.delete('/',(req, res) => {
    db.collection("working").doc(req.query.id).delete().then(() => {
        res.status(200).send("Document successfully deleted!")
    }).catch((error) => {
        res.status(401).send("Error removing document: ", error)
    });
});

app.delete('/fabricroll',(req, res) => {
  if(typeof req.body == 'object') {
      var data = req.body
  } else if(isJson(req.body)) {
      var data = JSON.parse(req.body)
  } else {
      res.status(400).json({msg: "not json format"})
  }
  var sfDocRef = db.collection("working").doc(req.query.id)
        return db.runTransaction((transaction) => {
            return transaction.get(sfDocRef).then(async (docs) => {
                if (!docs.exists) {
                    res.status(400).send({error : "Document does not exist!"})
                }
                const deleteFabricRoll = async (docs, id) => {
                    let new_fabricRolls = []
                        console.log('console.log(docs[i].fabricRolls.length) = '+docs.fabricRolls.length)
                        for (var j = 0; j < docs.fabricRolls.length; j++) {
                            console.log(docs.fabricRolls[j].id + '!=' + id)
                            if(docs.fabricRolls[j].id != id) {
                                console.log('push')
                                new_fabricRolls.push(docs.fabricRolls[j])
                            }
                        }

                        console.log(new_fabricRolls)
                    return new_fabricRolls
                }
                let new_fabricRolls = await deleteFabricRoll(docs.data(), data.idFabricRoll)
                transaction.update(sfDocRef, {
                        fabricRolls: new_fabricRolls
                })
            })
        }).then(() => {
            res.status(200).send("Transaction successfully committed!")
        }).catch((err) => {
            res.status(400).send(err)
        })
})

module.exports = app
