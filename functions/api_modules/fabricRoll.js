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

const frGroupByColor = (data) => {
    return new Promise((resolve, reject) => {
        try {
            var json = {
                number: 0,
                fabricRoll: []
            }
            var unique = [...new Set(data.map(d => {
                return d.fabricColor
            }))]
            for (var i = 0; unique[i]; i++) {
                var obj = {
                    color: unique[i],
                    colorCode: "",
                    number: 0
                }
                data.forEach(data_col => {
                    if(data_col.fabricColor === unique[i]) {
                        if(!obj.colorCode) {
                            obj.colorCode = data_col.fabricColorCode
                        }
                        json.number++
                        obj.number++
                    }
                })
                json.fabricRoll.push(obj)
            }
            json.fabricRoll.sort((a, b) => a.number - b.number)
            return resolve(json)
        } catch(err) {
            return reject(err)
        }        
    })
}

const frGroupByType = (data) => {
    return new Promise((resolve, reject) => {
        try {
            var json = {
                number: 0,
                fabricRoll: []
            }
            var unique = [...new Set(data.map(d => {
                return d.fabricType
            }))]
            for (var i = 0; unique[i]; i++) {
                var obj = {
                    type: unique[i],
                    number: 0
                }
                data.forEach(data_col => {
                    if(data_col.fabricType === unique[i]) {
                        json.number++
                        obj.number++
                    }
                })
                json.fabricRoll.push(obj)
            }
            json.fabricRoll.sort((a, b) => a.number - b.number)
            return resolve(json)
        } catch(err) {
            return reject(err)
        }        
    })
}

const frGroupByType2 = (data) => {
    return new Promise((resolve, reject) => {
        try {
            var fabricRoll = []
            var unique = [...new Set(data.map(d => {
                return d.fabricType
            }))]
            for (var i = 0; unique[i]; i++) {
                var obj = {
                    type: unique[i],
                    number: 0
                }
                data.forEach(data_col => {
                    if(data_col.fabricType === unique[i]) {
                        //obj.data.push(data_col)
                        obj.number++
                    }
                })
                fabricRoll.push(obj)
            }
            return resolve(fabricRoll)
        } catch(err) {
            return reject(err)
        }
    })
}
const frGroupByColor2 = (data) => {
    return new Promise((resolve, reject) => {
        try {
        var fabricRoll = []
        var unique = [...new Set(data.map(d => {
            return d.fabricColor
        }))]
        for (var i = 0; unique[i]; i++) {
            var obj = {
                color: unique[i],
                colorCode: "",
                number: 0
            }
            data.forEach(data_col => {
                if(data_col.fabricColor === unique[i]) {
                    if(!obj.colorCode) {
                        obj.colorCode = data_col.fabricColorCode
                    }
                    obj.number++
                }
            })
            fabricRoll.push(obj)
        }
        return resolve(fabricRoll)
        } catch(err) {
        return reject(err)
        }
    })
}

const frGroupByTypeAndColor = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            var json = {
                number: 0,
                fabricRoll: []
            }
            var unique = [...new Set(data.map(d => {
                return d.fabricType
            }))]
            for (var i = 0; unique[i]; i++) {
                var obj = {
                    type: unique[i],
                    number: 0,
                    data: []
                }
                data.forEach(data_col => {
                    if(data_col.fabricType === unique[i]) {
                        obj.data.push(data_col)
                        obj.number++
                        json.number++
                    }
                })
                json.fabricRoll.push(obj)
            }
            for (let i = 0; i < json.fabricRoll.length; i++) {
                json.fabricRoll[i].data = await frGroupByColor2(json.fabricRoll[i].data)
            }
            json.fabricRoll.sort((a, b) => a.number - b.number)
            return resolve(json)
        } catch(err) {
            return reject(err)
        }
    })
}

const frGroupByColorAndType = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            var json = {
                number: 0,
                fabricRoll: []
            }
            var unique = [...new Set(data.map(d => {
                return d.fabricColor
            }))]
            for (var i = 0; unique[i]; i++) {
                var obj = {
                    color: unique[i],
                    colorCode: "",
                    number: 0,
                    data: []
                }
                data.forEach(data_col => {
                    if(data_col.fabricColor === unique[i]) {
                        if(!obj.colorCode) {
                            obj.colorCode = data_col.fabricColorCode
                        }
                        obj.data.push(data_col)
                        obj.number++
                        json.number++
                    }
                })
                json.fabricRoll.push(obj)
            }
            for (let i = 0; i < json.fabricRoll.length; i++) {
                json.fabricRoll[i].data = await frGroupByType2(json.fabricRoll[i].data)
            }
            json.fabricRoll.sort((a, b) => a.number - b.number)
            return resolve(json)
        } catch(err) {
            return reject(err)
        }
    })
  }

const frGroupBySupplier = (data) => {
    return new Promise((resolve, reject) => {
        try {
            let json = {
                number: 0,
                data: []
            }
            console.log('unique')
            var unique = [...new Set(data.map(d => {
                return d.supplier.name
            }))]
            console.log(unique)
            for (var i = 0; unique[i]; i++) {
                var obj = {
                    name: unique[i],
                    number: 0
                }
                data.forEach(data_col => {
                    if(data_col.supplier.name === unique[i]) {
                        obj.number++
                        json.number++
                    }
                })
                json.data.push(obj)
            }
            console.log('json')
            console.log(json)
            return resolve(json)
        } catch(err) {
            return reject(err)
        }
    })
}
app.get('/groupbysupplier', (req, res) => {
    if(typeof req.query.status !== "undefined") {
        var data = []
        db.collection('fabricRoll').where('status', '==', req.query.status).get()
        .then(async (snapshot) => {
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
            })
            var new_data = await frGroupBySupplier(data)
            console.log(new_data)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send(err)
        })
    } else {
        var data = []
        db.collection('fabricRoll').get()
        .then(async (snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(doc.id != 'runNumber') {
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
                }
            })
            var new_data = await frGroupBySupplier(data)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send(err)
        })
    }
})

app.get('/groupbycolor', (req, res) => {
    var data = []
    if(typeof req.query.status !== "undefined") {
        db.collection('fabricRoll').where('status', '==', req.query.status).get()
        .then(async (snapshot) => {
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
            })
            var new_data = await frGroupByColor(data)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send(err)
        })
    } else {
        db.collection('fabricRoll').get()
        .then(async (snapshot) => {
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
            })
            var new_data = await frGroupByColor(data)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send(err)
        })
    }
})

app.get('/groupbycolorandtype', (req, res) => {
    var data = []
    if(typeof req.query.status !== "undefined") {
        db.collection('fabricRoll').where('status', '==', req.query.status).get()
        .then(async (snapshot) => {
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
            })
            var new_data = await frGroupByColorAndType(data)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send(err)
        })
    } else {
        db.collection('fabricRoll').get()
        .then(async (snapshot) => {
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
            })
            var new_data = await frGroupByColorAndType(data)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send(err)
        })
    }
})

app.get('/groupbytype', (req, res) => {
    var data = []
    if(typeof req.query.status !== "undefined") {
        db.collection('fabricRoll').where('status', '==', req.query.status).get()
        .then(async (snapshot) => {
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
            })
            var new_data = await frGroupByType(data)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send(err)
        })
    } else {
        db.collection('fabricRoll').get()
        .then(async (snapshot) => {
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
            })
            var new_data = await frGroupByType(data)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send(err)
        })
    }
})

app.get('/groupbytypeandcolor', (req, res) => {
    var data = []
    if(typeof req.query.status !== "undefined") {
        db.collection('fabricRoll').where('status', '==', req.query.status).get()
        .then(async (snapshot) => {
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
            })
            var new_data = await frGroupByTypeAndColor(data)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send(err)
        })
    } else {
        db.collection('fabricRoll').get()
        .then(async (snapshot) => {
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
            })
            var new_data = await frGroupByTypeAndColor(data)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send(err)
        })
    }
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
    console.log(data)
    var error_msg = "Error no field ["
    var error_chk = false
    if(!data.supplier) {
        error_msg += "supplier,"
        error_chk = true
    }
    if(!data.fabricType) {
        error_msg += "fabricType,"
        error_chk = true
    }
    if(!data.fabricColor) {
        error_msg += "fabricColor,"
        error_chk = true
    }
    if(!data.fabricColorCode) {
        error_msg += "fabricColorCode,"
        error_chk = true
    }
    if(!data.size) {
        error_msg += "size,"
        error_chk = true
    }
    if(!data.weight) {
        error_msg += "weight,"
        error_chk = true
    }
    if(!data.dateAdd) {
        error_msg += "dateAdd,"
        error_chk = true
    }
    if(!data.number) {
        error_msg += "number,"
        error_chk = true
    }
    if(error_chk) {
        error_msg += "]"
        res.status(400).json({msg:error_msg})
    }
    //get number
    var runNumber
    const getRunNumber = () => {
        return new Promise((resolve, reject) => {
            var docRef = db.collection("fabricRollCount").doc("count");
            docRef.get().then(function(doc) {
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
                    console.log("Document successfully written!");
                    console.log("doc.id = " + doc.id)
                    console.log("doc.data().idFabric = " + 'FR'+runNumber)
                    let data = {
                        id: doc.id,
                        idFabric: 'FR'+runNumber
                    }
                    resolve(data)
                })
                .catch(function(error) {
                    console.error("Error writing document: ", error);
                    reject(error)
                });
              })
            }
            const updateRunNumber = () => {
              return new Promise((resolve, reject) => {
                var batch = db.batch()
                var nycRef = db.collection("fabricRollCount").doc("count")
                batch.set(nycRef, {number: runNumber+1})
                batch.commit().then(() => {
                    console.log('Add fabric roll successful.')
                    resolve(true)
                })
              })
            }
            async function addFabricRolls() {
                let fabricRollsReturn = []
                let id
                let doc
                for (var i = 0; i < data.number; i++) {
                    await getRunNumber()
                    doc = await addFabricRoll(data)
                    fabricRollsReturn.push({
                        id : doc.id,
                        idFabric : doc.idFabric,
                        ...data
                    })
                    await updateRunNumber()
                }
                return fabricRollsReturn
            }
            addFabricRolls().then((fabricRollsReturn) => {
                console.log('fabricRollsReturn = ')
                console.log(fabricRollsReturn)
                res.status(200).json({
                    msg : "success",
                    data : fabricRollsReturn
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

//scan Qrcode state to scan
app.put('/scan', (req, res) => {
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

                    if (sfDoc.data().status == 'scan') {
                      res.status(400).json({
                        status: 1,
                        msg: 'This fabric already scan.'
                      })
                    } else if (sfDoc.data().status == 'use') {
                      res.status(400).json({
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
                res.status(200).json({msg:"Update status fabric roll to scan successful."})
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



/*
app.get('/',(req, res) => {
    var data = [];
    if(typeof req.query.id !== "undefined") {
        db.collection('fabricRoll').where('id', '==', req.query.id).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                data.push({
                    id : doc.id,
                    date : doc.data().date,
                    supplier: doc.data().supplier,
                    fabricType: doc.data().fabricType,
                    fabricColor: doc.data().fabricColor,
                    fabricColorCode: data().fabricColorCode,
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
        db.collection('fabricRoll').get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                data.push({
                    id : doc.id,
                    date : doc.data().date,
                    supplier: doc.data().supplier,
                    fabricType: doc.data().fabricType,
                    fabricColor: doc.data().fabricColor,
                    fabricColorCode: doc.data().fabricColorCode,
                    status : doc.data().status,
                    size: doc.data().size,
                    weight: doc.data().weight
                })
            });
            res.status(200).send(data);
        })
        .catch((err) => {
            console.log(err)
            res.status(401).json({msg : err});
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
        if(!data.supplier) {
            error_msg += "supplier,"
            error_chk = true
        }
        if(!data.fabricType) {
            error_msg += "fabricType,"
            error_chk = true
        }
        if(!data.fabricColor) {
            error_msg += "fabricColor,"
            error_chk = true
        }
        if(!data.fabricColorCode) {
            error_msg += "fabricColorCode,"
            error_chk = true
        }
        if(!data.size) {
            error_msg += "size,"
            error_chk = true
        }
        if(!data.weight) {
            error_msg += "weight,"
            error_chk = true
        }
        if(!data.date) {
            error_msg += "date,"
            error_chk = true
        }
        if(!data.status) {
            error_msg += "status,"
            error_chk = true
        }
        if(error_chk) {
            error_msg += "]"
            res.status(400).json({msg:error_msg})
        }
        var sfDocRef = db.collection("fabricRoll").doc(req.query.id);
        return db.runTransaction(function(transaction) {
            return transaction.get(sfDocRef).then(function(sfDoc) {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                    //throw "Document does not exist!";
                }
                transaction.update(sfDocRef, {
                    date : data.date,
                    supplier: data.supplier,
                    fabricType: data.fabricType,
                    fabricColor: data.fabricColor,
                    fabricColorCode: data.fabricColorCode,
                    status : data.status,
                    size: data.size,
                    weight: data.weight
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
    if(typeof req.body == 'object') {
        var data = req.body
    } else if(isJson(req.body)) {
        var data = JSON.parse(req.body)
    } else {
        res.status(400).json({msg:"not json format"})
    }
    var error_msg = "Error no field ["
    var error_chk = false
    if(!data.supplier) {
        error_msg += "supplier,"
        error_chk = true
    }
    if(!data.fabricType) {
        error_msg += "fabricType,"
        error_chk = true
    }
    if(!data.fabricColor) {
        error_msg += "fabricColor,"
        error_chk = true
    }
    if(!data.fabricColorCode) {
        error_msg += "fabricColorCode,"
        error_chk = true
    }
    if(!data.size) {
        error_msg += "size,"
        error_chk = true
    }
    if(!data.weight) {
        error_msg += "weight,"
        error_chk = true
    }
    if(!data.date) {
        error_msg += "date,"
        error_chk = true
    }
    if(!data.status) {
        error_msg += "status,"
        error_chk = true
    }
    if(!data.number) {
        error_msg += "number,"
        error_chk = true
    }
    if(error_chk) {
        error_msg += "]"
        res.status(400).json({msg:error_msg})
    }
    db.collection('fabricRoll').doc().set({
        date : data.date,
        supplier: data.supplier,
        fabricType: data.fabricType,
        fabricColor: data.fabricColor,
        fabricColorCode: data.fabricColorCode,
        status : data.status,
        size: data.size,
        weight: data.weight
    })
    res.status(200).send('Add fabric roll successful.');
});
app.delete('/',(req, res) => {
    db.collection("fabricRoll").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});
*/
module.exports = app
