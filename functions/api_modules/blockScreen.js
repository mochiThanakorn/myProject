const express = require('express');
const app = express();
const db = require('./db_connect');

app.use((req, res, next) => {
    const userToken = req.header('userToken')
    if(typeof userToken !== 'undefined' && userToken !== '') {
        db.collection('employees').where('user.userToken', '==', userToken).get()
        .then((snapshot) => {
            if (snapshot.empty) {
                res.status(400).json({error: 'userToken not found in db.'})
            } else {
                snapshot.docs.forEach((doc) => {
                        if(doc.data().user.authority !== 'undefined' && doc.data().user.authority.manageBlockScreen) {
                            next()
                        } else if(doc.data().user.authority.manageOrder && req.method === "GET") {
                            next()
                        } else {
                            res.status(400).json({error: 'User can\'t use BlockScreen API.'})
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
const isJsonString = (str) => {
    try {
        JSON.parse(str)
        return true
    } catch(err) {
        console.log("isJsonString() Error :", err)
        return false
    }
}

const getIdBlockScreen = () => {
    return new Promise((resolve, reject) => {
        return db.collection('blockScreen').doc('id').get()
        .then((doc) => {
            if (doc.exists) {
                increseIdBlockScreen()
                return resolve('BS-'+doc.data().id)
            } else {
                return reject(new Error("getIdBlockScreen() Error : There are no document"))
            }
        })
        .catch((err) => {
            return reject(err)
        })
    })
}
const increseIdBlockScreen = () => {
    var DocRef = db.collection("blockScreen").doc("id")
    db.runTransaction((transaction) => {
        return transaction.get(DocRef).then((doc) => {
            if (doc.exists) {
                var newId = doc.data().id + 1
                transaction.update(DocRef, { id: newId })
                return newId;
            }
            return Promise.reject("Document does not exist!")     
        })
    }).then((newId) => {
        return Promise.resolve(newId)
    }).catch((err) => {
        return Promise.reject(err)
    })
}

const validateBlockScreenKey = (data) => {
    var error_msg = "Error no field ["
    var error_chk = false
    if(!data.name || data.name == '') {
        error_msg += "name,"
        error_chk = true
    }
    if(!data.owner || data.owner == '') {
        error_msg += "owner,"
        error_chk = true
    }
    if(!data.date || data.date == '') {
        error_msg += "date,"
        error_chk = true
    }
    if(error_chk) {
        error_msg = error_msg.substring(0, error_msg.length-1)
        error_msg += "]"
        return {
            status: false,
            msg: error_msg
        }
    } else {
        return {
            status: true,
            msg: "valid key"
        }
    }
}

app.get('/id', async (req, res) => {
    try {
        let number = await getIdBlockScreen()
        res.status(200).send(String(number))
    } catch(err) {
        console.log(err)
        res.status(400).send(err)
    }
})

app.get('/customer', (req, res) => {
    if(typeof req.query.id == "undefined") {
        res.status(400).json('There are no id')
    } else if(typeof req.query.all == "undefined") {
        res.status(400).json('There are no all')
    }
    else {
        if(req.query.all == 'true') {
            var data = []
            db.collection('blockScreen').where('owner.id', '==', req.query.id).orderBy("idBlockScreen").get()
            .then((snapshot) => {
                if(snapshot.length == 0) {
                    res.status(400).json("data is not exist!")
                }
                snapshot.docs.forEach((doc) => {
                    if(doc.id !== 'id') {          
                        data.push({
                            id : doc.id,
                            idBlockScreen: doc.data().idBlockScreen,
                            name: doc.data().name,
                            owner: doc.data().owner,
                            date : doc.data().date,
                            status: doc.data().status
                        })
                    }
                })
                //res.status(200).send(data)
                db.collection('blockScreen').where('owner.id', '==', 'general').orderBy("idBlockScreen").get()
                .then((snapshot) => {
                    snapshot.docs.forEach((doc) => {
                        if(doc.id !== 'id') {          
                            data.push({
                                id : doc.id,
                                idBlockScreen: doc.data().idBlockScreen,
                                name: doc.data().name,
                                owner: doc.data().owner,
                                date : doc.data().date,
                                status: doc.data().status
                            })
                        }
                    })
                    res.status(200).send(data)
                })
                .catch((err) => {
                    res.status(400).json({error:err})
                })
            })
            .catch((err) => {
                res.status(400).json({error:err})
            })
        } else if(req.query.all == 'false') {
            var data = []
            db.collection('blockScreen').where('owner.id', '==', req.query.id).orderBy("idBlockScreen").get()
            .then((snapshot) => {
                snapshot.docs.forEach((doc) => {
                    if(doc.id !== 'id') {          
                        data.push({
                            id : doc.id,
                            idBlockScreen: doc.data().idBlockScreen,
                            name: doc.data().name,
                            owner: doc.data().owner,
                            date : doc.data().date
                        })
                    }
                })
                res.status(200).send(data)
            })
            .catch((err) => {
                res.status(400).json({error:err})
            })
        } else {
            res.status(400).json('bad request : all')
        }
    } 
})

app.get('/', async (req, res) => {
    if(typeof req.query.id !== "undefined") {
        var data
        db.collection('blockScreen').where('id', '==', req.query.id).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                data = {
                    id : doc.id,
                    idBlockScreen: doc.data().idBlockScreen,
                    name: doc.data().name,
                    owner: doc.data().owner,
                    date : doc.data().date,
                    status: doc.data().status
                }
            })
            res.status(200).send(data)
        })
        .catch((err) => {
            res.status(400).json({error:err})
        })
    }
    else {
        var data = []
        db.collection('blockScreen').orderBy("idBlockScreen").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(doc.id !== 'id') {          
                    data.push({
                        id : doc.id,
                        idBlockScreen: doc.data().idBlockScreen,
                        name: doc.data().name,
                        owner: doc.data().owner,
                        date: doc.data().date,
                        status: doc.data().status
                    })
                }
            })
            console.log(data)
            let filterData = data.filter(item => item.status == "enable")
            console.log(filterData)
            res.status(200).send(filterData)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).json({msg : err})
        })
    }
})

app.post('/', async (req, res) => {
    var data
    if(typeof req.body === 'object') {
        data = req.body
    } else if(isJsonString(req.body)) {
        data = JSON.parse(req.body)
    } else {
        res.status(400).send("Error : Not json format")
    }

    let chk = validateBlockScreenKey(data)
    if(!chk.status)
        res.status(400).send(chk.msg)

    var idBlockScreen = await getIdBlockScreen()

    var blockScreenRef = db.collection('blockScreen').doc()
    blockScreenRef.set({
        idBlockScreen: idBlockScreen,
        name: data.name,
        owner: data.owner,
        date : data.date,
        status: 'enable'
    }).then(() => {
        res.status(200).json({
            id: blockScreenRef.id,
            idBlockScreen: idBlockScreen    
        })
        return true
    }).catch((err) => {
        res.status(400).send('Error')
        console.log(err)
    })
})

app.put('/', (req, res) => {
    if(typeof req.query.id === "undefined") {
        res.send(400).send("There are no id")
    }
    
    var data
    if(typeof req.body === 'object') {
        data = req.body
    } else if(isJsonString(req.body)) {
        data = JSON.parse(req.body)
    } else {
        res.status(400).send("Error")
    }

    var docRef = db.collection("blockScreen").doc(req.query.id);
    return db.runTransaction((transaction) => {
        return transaction.get(docRef).then((doc) => {
            if (!doc.exists) {
                res.status(400).send("Document does not exist!")
            }
            transaction.update(docRef, {
                name: data.name,
                owner: data.owner,
                date : data.date
            })
        })
    }).then(() => {
        res.status(200).send("Success")
    }).catch((err) => {
        res.status(400).send(err)
    })
})

app.delete('/',(req, res) => {
    if(typeof req.query.id === "undefined") {
        res.send(400).send("There are no id")
    }
    db.collection("blockScreen").doc(req.query.id).delete()
    .then(() => {
        res.status(200).send("Success : Delete")
    }).catch((err) => {
        res.status(400).send(err)
    })
})

app.put('/enable', (req, res) => {
    if(typeof req.query.id === "undefined") {
        res.send(400).send("There are no id!")
    }
    var docRef = db.collection("blockScreen").doc(req.query.id);
    return db.runTransaction((transaction) => {
        return transaction.get(docRef).then((doc) => {
            if (!doc.exists) {
                res.status(400).send("Document does not exist!")
            }
            transaction.update(docRef, {
                status: 'enable'
            })
        })
    }).then(() => {
        res.status(200).send("Success")
    }).catch((err) => {
        res.status(400).send(err)
    })
})

app.put('/disable', (req, res) => {
    if(typeof req.query.id === "undefined") {
        res.send(400).send("There are no id!")
    }
    var docRef = db.collection("blockScreen").doc(req.query.id);
    return db.runTransaction((transaction) => {
        return transaction.get(docRef).then((doc) => {
            if (!doc.exists) {
                res.status(400).send("Document does not exist!")
            }
            transaction.update(docRef, {
                status: 'disable'
            })
        })
    }).then(() => {
        res.status(200).send("Success")
    }).catch((err) => {
        res.status(400).send(err)
    })
})

app.delete('/',(req, res) => {
    if(typeof req.query.id === "undefined") {
        res.send(400).send("There are no id")
    }
    db.collection("blockScreen").doc(req.query.id).delete()
    .then(() => {
        res.status(200).send("Success : Delete")
    }).catch((err) => {
        res.status(400).send(err)
    })
})

module.exports = app
