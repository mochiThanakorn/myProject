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

app.use((req, res, next) => {
    const userToken = req.header('userToken')
    if(typeof userToken !== 'undefined' && userToken !== '') {
        db.collection('employees').where('user.userToken', '==', userToken).get()
        .then((snapshot) => {
            if (snapshot.empty) {
                res.status(400).json({error: 'userToken not found.'})
            } else {
                snapshot.docs.forEach((doc) => {
                    if(doc.data().user.authority !== 'undefined' && doc.data().user.authority.manageBlockScreen) {
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

app.get('/',(req, res) => {
    if(typeof req.query.id !== "undefined") {
        db.collection('blockScreen').doc(req.query.id).get()
        .then((doc) => {
            if(doc.exist){
                let data = {
                    id : doc.id,
                    name : doc.data().name,
                    date : doc.data().date
                }
                res.status(200).send(data)
            } else {
              res.status(400).send('no document')
            }
        })
        .catch((err) => {
            res.status(401).json({error:err})
        })
    }
    else {
      var data = [];
      db.collection('blockScreen').orderBy("date").get()
      .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                data.push({
                    id : doc.id,
                    name : doc.data().name,
                    date : doc.data().date
                })
            })
            res.status(200).send(data)
        })
        .catch((err) => {
            console.log(err)
            res.status(401).json({msg : err})
        })
    }
})

const getIdBlockScreen = () => {
  return new Promise ((resolve, reject) => {
    db.collection("ID_blockScreen").doc("count").get()
    .then((doc) => {
      if (doc.exists) {
        var idBlockScreen = doc.data().number
        resolve(idBlockScreen)
      } else {
        console.log("No such document!")
        resolve(false)
      }
    })
  })
}

app.get('/idblockscreen',async (req, res) => {
  let id = await getIdBlockScreen()
  res.status(200).send(''+id)
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
        var sfDocRef = db.collection("position").doc(req.query.id);
        return db.runTransaction(function(transaction) {
            return transaction.get(sfDocRef).then(function(sfDoc) {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                    //throw "Document does not exist!";
                }
                transaction.update(sfDocRef, {
                    name : data.name
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
})

const getAndUpdateIdblockScreen = () => {
  return new Promise ((resolve, reject) => {
    db.collection("ID_blockScreen").doc("count").get()
    .then((doc) => {
      if (doc.exists) {
        var idBlockScreen = doc.data().number
        var batch = db.batch()
        var blockScreenCountRef = db.collection("ID_blockScreen").doc("count")
        batch.set(blockScreenCountRef, {number: idBlockScreen + 1})
        batch.commit().then(() => {
          resolve(idBlockScreen)
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

app.post('/', async (req, res) => {
    console.log("post block screen")
    if(typeof req.body == 'object') {
        var data = req.body
    } else if(isJson(req.body)) {
        var data = JSON.parse(req.body)
    } else {
        res.status(400).json({msg:"not json format"})
    }
    let id = await getAndUpdateIdblockScreen()
    db.collection('blockScreen').doc().set({
      id: 'BS'+id,
      name : data.name,
      date : data.date
    })
    .then(()=>{
        res.status(200).send('Add block screen successful.')
    })
    .catch((err) => {
      console.log(err)
      res.status(400).send(err)
    })
})

app.delete('/',(req, res) => {
    db.collection("position").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

module.exports = app
