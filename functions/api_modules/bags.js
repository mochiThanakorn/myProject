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

async function addFabricRolls() {
    for (var i = 0; i < data.number; i++) {
        await getRunNumber()
        await addFabricRoll(data)
        await updateRunNumber()
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
                        if(doc.data().user.authority.manageFabrics !== 'undefined' && doc.data().user.authority.manageFabrics) {
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

//Functions
//Add Bags
const getRunNumberOfBag = () => {
  return new Promise((resolve, reject) => {
    var docRef = db.collection("bagCount").doc("count");
    docRef.get().then((doc) => {
      if (doc.exists) {
        runNumber = doc.data().number
        console.log(runNumber)
        resolve(true)
      } else {
        console.log("No such document!")
        resolve(false)
      }
    })
  })
}
const addBag = (data) => {
  return new Promise((resolve, reject) => {
    let doc = db.collection('bags').doc()
    doc.set({
      idBag : 'BG'+runNumber,
      fabrics: data.fabrics
    })
    .then(() => {
      console.log("Document successfully written!")
      resolve(true)
    })
    .catch((error) => {
      console.error("Error writing document: ", error)
      reject(error)
    })
  })
}
const updateRunNumberOfBag = () => {
  return new Promise((resolve, reject) => {
    var batch = db.batch()
    var nycRef = db.collection("bagCount").doc("count")
    batch.set(nycRef, {number: runNumber+1})
    batch.commit().then(() => {
      resolve(true)
    })
  })
}
const addBags = async bags => {
  for (let i = 0; i < bags.length; i++) {
    await getRunNumberOfBag()
    await addBag(bags[i])
    await updateRunNumberOfBag()
  }
  return true
}

app.get('/bagid', (req, res) => {
  db.collection("bagCount").doc("count").get()
  .then((doc) => {
    if (doc.exists) {
      //convert int to string
      let number = '' + doc.data().number
      res.status(200).send(number)
    } else {
      res.status(400).send('There are document')
    }
  })
})

//printed
app.get('/printed',(req, res) => {
    var dataArr = [];
    db.collection('fabricRoll').where('printed', '==', true).get()
    .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
            dataArr.push({
                id : doc.id,
                    idFabric : doc.data().idFabric,
                    dateAdd : doc.data().dateAdd,
                    dateUse : doc.data().dateUse,
                    supplier: doc.data().supplier,
                    fabricType: doc.data().fabricType,
                    fabricColor: doc.data().fabricColor,
                    fabricColorCode: doc.data().fabricColorCode,
                    printed: doc.data().printed,
                    status : doc.data().status,
                    size: doc.data().size,
                    weight: doc.data().weight
            })
        });
        res.status(200).send(dataArr);
    })
    .catch((err) => {
        console.log(err)
        res.status(401).json({msg : err});
    });
});
//not yet printed
app.get('/notyetprinted',(req, res) => {
    var dataArr = [];
    db.collection('fabricRoll').where('printed', '==', false).get()
    .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
            dataArr.push({
                id : doc.id,
                    idFabric : doc.data().idFabric,
                    dateAdd : doc.data().dateAdd,
                    dateUse : doc.data().dateUse,
                    supplier: doc.data().supplier,
                    fabricType: doc.data().fabricType,
                    fabricColor: doc.data().fabricColor,
                    fabricColorCode: doc.data().fabricColorCode,
                    printed: doc.data().printed,
                    status : doc.data().status,
                    size: doc.data().size,
                    weight: doc.data().weight
            })
        });
        res.status(200).send(dataArr);
    })
    .catch((err) => {
        console.log(err)
        res.status(401).json({msg : err});
    });
});


app.get('/',(req, res) => {
    var data = [];
    if(typeof req.query.id !== "undefined") {
        db.collection('fabricRoll').where('id', '==', req.query.id).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                data.push({
                    id : doc.id,
                    idFabric : doc.data().idFabric,
                    dateAdd : doc.data().dateAdd,
                    dateUse : doc.data().dateUse,
                    supplier: doc.data().supplier,
                    fabricType: doc.data().fabricType,
                    fabricColor: doc.data().fabricColor,
                    fabricColorCode: doc.data().fabricColorCode,
                    printed: doc.data().printed,
                    status : doc.data().status,
                    size: doc.data().size,
                    weight: doc.data().weight
                })
            });
            res.status(200).send(data);
        })
        .catch((err) => {
            res.status(401).json({error:err});
        });
    }
    else {
        db.collection('fabricRoll').orderBy("idFabric").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                data.push({
                    id : doc.id,
                    idFabric : doc.data().idFabric,
                    dateAdd : doc.data().dateAdd,
                    dateUse : doc.data().dateUse,
                    supplier: doc.data().supplier,
                    fabricType: doc.data().fabricType,
                    fabricColor: doc.data().fabricColor,
                    fabricColorCode: doc.data().fabricColorCode,
                    printed: doc.data().printed,
                    status : doc.data().status,
                    size: doc.data().size,
                    weight: doc.data().weight
                })
            });
            res.status(200).send(data);
        })
        .catch((err) => {
            console.log(err)
            res.status(401).json({msg : err})
        })
    }
})

const updateFabricRoll = (data) => {
    return new Promise((resolve, reject) => {
        var sfDocRef = db.collection("fabricRoll").doc(data.id);
        return db.runTransaction((transaction) => {
            return transaction.get(sfDocRef).then((sfDoc) => {
                if (!sfDoc.exists) {
                    console("Document does not exist!")
                    reject({err: "Document does not exist!"})
                }
                if(typeof data.supplier !== 'undefined') var supplierVal = data.supplier
                else var supplierVal = sfDoc.data().supplier
                if(typeof data.fabricColor !== 'undefined') var fabricColorVal = data.fabricColor
                else var fabricColorVal = sfDoc.data().fabricColor
                if(typeof data.fabricColorCode !== 'undefined') var fabricColorCodeVal = data.fabricColorCode
                else var fabricColorCodeVal = sfDoc.data().fabricColorCode
                if(typeof data.fabricType !== 'undefined') var fabricTypeVal = data.fabricType
                else var fabricTypeVal = sfDoc.data().fabricType
                if(typeof data.size !== 'undefined') var sizeVal = data.size
                else var sizeVal = sfDoc.data().size
                if(typeof data.weight !== 'undefined') var weightVal = data.weight
                else var weightVal = sfDoc.data().weight
                if(typeof data.printed !== 'undefined') var printedVal = data.printed
                else var printedVal = sfDoc.data().printed
                if(typeof data.status !== 'undefined') var statusVal = data.status
                else var statusVal = sfDoc.data().status
                if(typeof data.dateAdd !== 'undefined') var dateAddVal = data.dateAdd
                else var dateAddVal = sfDoc.data().dateAdd
                if(typeof data.dateUse !== 'undefined') var dateUseVal = data.dateUse
                else var dateUseVal = sfDoc.data().dateUse

                transaction.update(sfDocRef, {
                    dateAdd : dateAddVal,
                    dateUse : dateUseVal,
                    supplier : supplierVal,
                    fabricType: fabricTypeVal,
                    fabricColor: fabricColorVal,
                    fabricColorCode: fabricColorCodeVal,
                    status : statusVal,
                    printed : printedVal,
                    size: sizeVal,
                    weight: weightVal
                })
            })
        }).then(() => {
            console.log("Transaction successfully committed!")
            resolve(true)
        }).catch((errorMsg) => {
            console.log({error : errorMsg})
            reject(errorMsg)
        })
    })
}
const updateFabricRolls = async docs => {
    for(let i = 0; i < docs.docs.length; i++) {
        console.log(docs.docs[i])
        await updateFabricRoll(docs.docs[i])
    }
    /*docs.forEach(async doc => {
        console.log(doc)
        await updateFabricRoll(doc)
    })*/
}

app.put('/multiple', (req, res) => {
    console.log('fabricRoll PUT MULTI')
        if(typeof req.body == 'object') {
            var data = req.body
        } else if(isJson(req.body)) {
            var data = JSON.parse(req.body)
        } else {
            res.status(400).json({msg:"not json format"})
        }
        console.log(data)
        console.log(typeof data)
        updateFabricRolls(data).then(() => {
            res.status(200).json({msg:"Update fabric rolls successful."})
        })
})

app.put('/', (req, res) => {
    if(typeof req.query.id !== "undefined") {
        if(typeof req.body == 'object') {
            var data = req.body
        } else if(isJson(req.body)) {
            var data = JSON.parse(req.body)
        } else {
            res.status(400).json({msg:"not json format"})
        }
            var sfDocRef = db.collection("fabricRoll").doc(req.query.id);
            return db.runTransaction((transaction) => {
                return transaction.get(sfDocRef).then((sfDoc) => {
                    if (!sfDoc.exists) {
                        res.send(401).send({err: "Document does not exist!"})
                    }
                    if(typeof data.supplier !== 'undefined') var supplierVal = data.supplier
                    else var supplierVal = sfDoc.data().supplier
                    if(typeof data.fabricColor !== 'undefined') var fabricColorVal = data.fabricColor
                    else var fabricColorVal = sfDoc.data().fabricColor
                    if(typeof data.fabricColorCode !== 'undefined') var fabricColorCodeVal = data.fabricColorCode
                    else var fabricColorCodeVal = sfDoc.data().fabricColorCode
                    if(typeof data.fabricType !== 'undefined') var fabricTypeVal = data.fabricType
                    else var fabricTypeVal = sfDoc.data().fabricType
                    if(typeof data.size !== 'undefined') var sizeVal = data.size
                    else var sizeVal = sfDoc.data().size
                    if(typeof data.weight !== 'undefined') var weightVal = data.weight
                    else var weightVal = sfDoc.data().weight
                    if(typeof data.printed !== 'undefined') var printedVal = data.printed
                    else var printedVal = sfDoc.data().printed
                    if(typeof data.status !== 'undefined') var statusVal = data.status
                    else var statusVal = sfDoc.data().status
                    if(typeof data.dateAdd !== 'undefined') var dateAddVal = data.dateAdd
                    else var dateAddVal = sfDoc.data().dateAdd
                    if(typeof data.dateUse !== 'undefined') var dateUseVal = data.dateUse
                    else var dateUseVal = sfDoc.data().dateUse

                    transaction.update(sfDocRef, {
                        dateAdd : dateAddVal,
                        dateUse : dateUseVal,
                        supplier : supplierVal,
                        fabricType: fabricTypeVal,
                        fabricColor: fabricColorVal,
                        fabricColorCode: fabricColorCodeVal,
                        status : statusVal,
                        printed : printedVal,
                        size: sizeVal,
                        weight: weightVal
                    })
                })
            }).then(() => {
                res.status(200).json({msg:"Update fabric rolls successful."})
            }).catch((err) => {
                res.send(401).send(err)
            })
            /*updateFabricRoll(data).then(() => {
            res.status(200).json({msg:"Update fabric rolls successful."})
        })*/
    }
    else {
        res.send(401).send("not found id.")
    }
})

app.post('/multiple', (req, res) => {
    console.log('fabricRoll POST MULTI')
    const getRunNumber = () => {
        return new Promise((resolve, reject) => {
            var docRef = db.collection("fabricRollCount").doc("count");
            docRef.get().then(function(doc) {
                if (doc.exists) {
                    runNumber = doc.data().number
                    console.log(runNumber)
                    resolve(true);
                } else {
                    console.log("No such document!")
                    resolve(false);
                }
            })
        })
    }
    const addFabricRoll = (data) => {
        return new Promise((resolve, reject) => {
            let doc = db.collection('fabricRoll').doc()
            doc.set({
                idFabric : 'FR'+runNumber,
                dateAdd : data.dateAdd,
                dateUse : null,
                supplier: data.supplier,
                fabricType: data.fabricType,
                fabricColor: data.fabricColor,
                fabricColorCode: data.fabricColorCode,
                status : 'wait',
                printed : false,
                size: data.size,
                weight: data.weight
            })
            .then(() => {
                console.log("Document successfully written!")
                resolve(doc.id)
            })
            .catch((error) => {
                console.error("Error writing document: ", error)
                reject(error)
            })
        })
    }
    const updateRunNumber = () => {
        return new Promise((resolve, reject) => {
            var batch = db.batch()
            var nycRef = db.collection("fabricRollCount").doc("count")
            batch.set(nycRef, {number: runNumber+1})
            batch.commit().then(function () {
                console.log('Add fabric roll successful.')
                resolve(true)
            })
        })
      }
    async function addFabricRolls(AllData) {
        let fabricRollsReturn = []
        for (var i = 0; i < AllData.length; i++) {
            await getRunNumber()
            let id = await addFabricRoll(AllData[i])
            fabricRollsReturn.push({
                "id" : id,
                ...AllData[i]
            })
            await updateRunNumber()
        }
        return fabricRollsReturn
    }
    let Alldata
    if(typeof req.body == 'object') {
        Alldata = req.body
    } else if(isJson(req.body)) {
        Alldata = JSON.parse(req.body)
    } else {
        res.status(400).json({msg:"not json format"})
    }
    addFabricRolls(Alldata).then((fabricRollsReturn) => {
        res.status(200).json({
            msg : 'Add multiple fabric rolls successful.',
            data :fabricRollsReturn
        })
    })
})

app.post('/',(req, res) => {
  if(typeof req.body == 'object') {
    var data = req.body
  } else if(isJson(req.body)) {
    var data = JSON.parse(req.body)
  } else {
    res.status(400).json({msg:"not json format"})
  }

  var runNumber
  var bags = data.bags

  addBags(bags).then(() => {
    res.status(200).json({
      msg : "success"
    })
  })
  .catch((err) => {
    res.status(400).json({
      msg: err
    })
  })
})



const delFabricRoll = id => {
    console.log('delFabricRoll, id = ')
    console.log(id)
    return new Promise((resolve, reject) => {
        let fabricRollRef = db.collection("fabricRoll").doc(id)
        fabricRollRef.delete().then(() => {
            console.log(`fabricRoll id ${id} is successfully deleted!`)
            resolve(true)
        }).catch(error => {
            console.log("Error removing document: ", error)
            reject(error)
        })
    })
}

const delFabricRolls = async (docs) => {
    console.log('delFabricRolls, docs = ')
    console.log(docs)
    console.log(docs.ids.length)
    for(let i = 0 ; i < docs.ids.length ; i++) {
        console.log('i = '+i+", docs.ids[i] = "+docs.ids[i])
        await delFabricRoll(docs.ids[i])
    }
}

app.delete('/multiple',(req, res) => {
    if(typeof req.body == 'object') {
        console.log('1')
        var data = req.body
    } else if(isJson(req.body)) {
        console.log('2')
        var data = JSON.parse(req.body)
    } else {
        res.status(400).json({msg:"not json format"})
    }
    console.log("req.body = ")
    console.log(req.body)
    //var data = JSON.parse(req.body)
    console.log(typeof data)
    console.log('data = ')
    console.log(data)
    delFabricRolls(data).then(()=>{
        res.status(200).send('Delete fabric rolls successful.')
    }).catch((err)=>{
        console.log(err)
        res.status(400).send(err)
    })
})

app.delete('/',(req, res) => {
    /*let id = req.query.id
    delFabricRoll(id)*/
    db.collection("fabricRoll").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!")
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error)
    })
})

module.exports = app


app.post('/',(req, res) => {
  console.log('start post bags')
  /*console.log(req.body)
  var data = req.body
  let bags = data.bags
  console.log(typeof data)
  console.log(bags)
  console.log(bags[0].id)*/
  console.log("post bags")
  console.log(req.body)
  if(typeof req.body == 'object') {
    console.log("object")
    var data = req.body
    console.log(data.bags[0].fabrics[0].id)
  } else if(isJson(req.body)) {
    console.log("json")
    var data = JSON.parse(req.body)
    console.log(data.bags[0].fabrics[0].id)
  } else {
    console.log("string")
    res.status(400).json({msg:"not json format"})
  }
  let bags = data.bags
  console.log(bags[0].id)
  //res.status(200).send('OK')
    bags.forEach(async (bag) => {
      console.log('foreach bags')
      console.log(bag);
      await addBag(bag)
    }).then(() => {
      res.status(200).send('Add bags successful.')
    }).catch((err) => {
      console.log(err)
      res.status(401).send("ERROR : ", err)
    })
})
