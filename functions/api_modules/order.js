const express = require('express');
const app = express();
const db = require('./db_connect');

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

const getIdOrder = () => {
    return new Promise((resolve, reject) => {
        return db.collection('order').doc('id').get()
        .then((doc) => {
            if (doc.exists) {
                return resolve('O-'+doc.data().id)
            } else {
                //console.log("getIdOrder() Error : There are no document order id")
                return reject(new Error("getIdOrder() Error : There are no document order id"))
            }
        })
        .catch((err) => {
            //console.log("getIdOrder() Error :", err)
            return reject(err)
        })
    })
}
const increseIdOrder = () => {
    var DocRef = db.collection("order").doc("id")
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

const validateOrderKey = (data) => {
    var error_msg = "Error no field ["
    var error_chk = false
    if(!data.creator) {
        error_msg += "creator,"
        error_chk = true
    }
    if(!data.createDate) {
        error_msg += "createDate,"
        error_chk = true
    }
    if(!data.customer) {
        error_msg += "customer,"
        error_chk = true
    }
    if(!data.blockScreen) {
        error_msg += "blockScreen,"
        error_chk = true
    }
    if(!data.detail) {
        error_msg += "detail,"
        error_chk = true
    }
    if(!data.number) {
        error_msg += "number,"
        error_chk = true
    }
    if(!data.pricePerPiece) {
        error_msg += "pricePerPiece,"
        error_chk = true
    }
    if(!data.totalPrice) {
        error_msg += "totalPrice,"
        error_chk = true
    }
    if(!data.deposit) {
        error_msg += "deposit,"
        error_chk = true
    }
    if(!data.status) {
        error_msg += "status,"
        error_chk = true
    }
    if(!data.deliveryDate) {
        error_msg += "deliveryDate,"
        error_chk = true
    }
    if(!data.note) {
        error_msg += "note,"
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
const groupByDateOrder = (data) => {
    return new Promise((resolve, reject) => {
        try {
            let unique = [...new Set(data.map(d => {
                return d.deliveryDate
              }))]
              let newData = {
                number: 0,
                amount: 0,
                data: []
              }
              console.table(unique)
              unique.forEach((uniqueData) => {
                let tmpData = {
                  date: uniqueData,
                  number: 0,
                  amount: 0,
                  orders: []
                }
                data.forEach((allData) => {
                  if(uniqueData == allData.deliveryDate) {
                    tmpData.number += 1
                    tmpData.amount += allData.totalPrice*1
                    tmpData.orders.push(allData)
                    newData.number += 1
                    newData.amount += allData.totalPrice*1
                  }
                })
                newData.data.push(tmpData)
               })
           return resolve(newData)
        } catch(err) {
          return reject(err)
        }
      })
}
const groupByMonthAndYearOrder = (data, month, year) => {
    return new Promise((resolve, reject) => {
      try {
        let unique = [...new Set(data.map(d => {
            return d.deliveryDate
          }))]
          let newData = {
            number: 0,
            amount: 0,
            data: []
          }
          console.table(unique)
          unique.forEach((uniqueData) => {
            let tmpData = {
              date: uniqueData,
              number: 0,
              amount: 0,
              orders: []
            }
            data.forEach((allData) => {
              if(uniqueData == allData.deliveryDate) {
                tmpData.number += 1
                tmpData.amount += allData.totalPrice*1
                tmpData.orders.push(allData)
                newData.number += 1
                newData.amount += allData.totalPrice*1
              }
            })
            newData.data.push(tmpData)
           })
        let newData2 = {
            number: 0,
            amount: 0,
            data: []
        }
        newData.data.forEach((d) => {
          let date = d.date.split('/')
          let m = date[1]*1
          let y = date[2]*1
          if(m == month && y == year) {
                newData2.number += d.number
                newData2.amount += d.amount
                newData2.data.push(d)
          }
        })
        return resolve(newData2)
      } catch(err) {
        return reject(err)
      }
    })
  }

  const groupByYearOrder = (data, year) => {
    return new Promise((resolve, reject) => {
      try {
          let newData = {
            number: 0,
            amount: 0,
            data: []
          }
        for(let i = 1; i <= 12; i++) {
            let tmpData = {
                month: i,
                year: year,
                number: 0,
                amount: 0,
                orders: []
              }
              data.forEach((allData) => {
                let date = allData.deliveryDate.split('/')
                let m = date[1]*1
                let y = date[2]*1
                if(m == i && y == year) {
                  tmpData.number += 1
                  tmpData.amount += allData.totalPrice*1
                  tmpData.orders.push(allData)
                  newData.number += 1
                  newData.amount += allData.totalPrice*1
                }
              })
              newData.data.push(tmpData)
        }  
        return resolve(newData)
      } catch(err) {
        return reject(err)
      }
    })
  }

app.get('/statistic', (req, res) => {
    if(typeof req.query.month !== "undefined" && typeof req.query.year !== "undefined") {
        var data = []
        db.collection('order').orderBy("idOrder", "desc").get()
        .then(async (snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(doc.id !== 'id') {          
                    data.push({
                        id : doc.id,
                        idOrder: doc.data().idOrder,
                        creator: doc.data().creator,
                        createDate: doc.data().createDate,
                        customer : doc.data().customer, 
                        blockScreen: doc.data().blockScreen,
                        detail: doc.data().detail,
                        number: doc.data().number,
                        pricePerPiece: doc.data().pricePerPiece,
                        totalPrice: doc.data().totalPrice,
                        deposit: doc.data().deposit,
                        deliveryDate: doc.data().deliveryDate,
                        note: doc.data().note,
                        shippingCost: doc.data().shippingCost,
                        status: doc.data().status
                    })
                }
            })
            let new_data = await groupByMonthAndYearOrder(data, req.query.month, req.query.year)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).json({msg : err})
        })
    } else if(typeof req.query.year !== "undefined") {
        var data = []
        db.collection('order').orderBy("idOrder", "desc").get()
        .then(async (snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(doc.id !== 'id') {          
                    data.push({
                        id : doc.id,
                        idOrder: doc.data().idOrder,
                        creator: doc.data().creator,
                        createDate: doc.data().createDate,
                        customer : doc.data().customer, 
                        blockScreen: doc.data().blockScreen,
                        detail: doc.data().detail,
                        number: doc.data().number,
                        pricePerPiece: doc.data().pricePerPiece,
                        totalPrice: doc.data().totalPrice,
                        deposit: doc.data().deposit,
                        deliveryDate: doc.data().deliveryDate,
                        note: doc.data().note,
                        shippingCost: doc.data().shippingCost,
                        status: doc.data().status
                    })
                }
            })
            let new_data = await groupByYearOrder(data, req.query.year)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).json({msg : err})
        })
    } else if(typeof req.query.date !== "undefined"){
        var data = []
        db.collection('order').where("deliveryDate", "==", req.query.date).get()
        .then(async (snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(doc.id !== 'id') {          
                    data.push({
                        id : doc.id,
                        idOrder: doc.data().idOrder,
                        creator: doc.data().creator,
                        createDate: doc.data().createDate,
                        customer : doc.data().customer, 
                        blockScreen: doc.data().blockScreen,
                        detail: doc.data().detail,
                        number: doc.data().number,
                        pricePerPiece: doc.data().pricePerPiece,
                        totalPrice: doc.data().totalPrice,
                        deposit: doc.data().deposit,
                        deliveryDate: doc.data().deliveryDate,
                        note: doc.data().note,
                        shippingCost: doc.data().shippingCost,
                        status: doc.data().status
                    })
                }
            })
            let new_data = await groupByDateOrder(data)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).json({msg : err})
        })
    }{
        var data = []
        db.collection('order').orderBy("idOrder", "desc").get()
        .then(async (snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(doc.id !== 'id') {          
                    data.push({
                        id : doc.id,
                        idOrder: doc.data().idOrder,
                        creator: doc.data().creator,
                        createDate: doc.data().createDate,
                        customer : doc.data().customer, 
                        blockScreen: doc.data().blockScreen,
                        detail: doc.data().detail,
                        number: doc.data().number,
                        pricePerPiece: doc.data().pricePerPiece,
                        totalPrice: doc.data().totalPrice,
                        deposit: doc.data().deposit,
                        deliveryDate: doc.data().deliveryDate,
                        note: doc.data().note,
                        shippingCost: doc.data().shippingCost,
                        status: doc.data().status
                    })
                }
            })
            let new_data = await groupByDateOrder(data)
            res.status(200).send(new_data)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).json({msg : err})
        })
    }
})

app.get('/id', async (req, res) => {
    try {
        let number = await getIdOrder()
        res.status(200).send(String(number))
    } catch(err) {
        console.log(err)
        res.status(400).send(err)
    }
})

app.get('/', async (req, res) => {
    if(typeof req.query.id !== "undefined") {
        var data
        db.collection('order').where('id', '==', req.query.id).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                data = {
                    id : doc.id,
                    idOrder: doc.data().idOrder,
                    creator: doc.data().creator,
                    createDate: doc.data().createDate,
                    customer : doc.data().customer, 
                    blockScreen: doc.data().blockScreen,
                    detail: doc.data().detail,
                    number: doc.data().number,
                    pricePerPiece: doc.data().pricePerPiece,
                    totalPrice: doc.data().totalPrice,
                    deposit: doc.data().deposit,
                    deliveryDate: doc.data().deliveryDate,
                    note: doc.data().note,
                    shippingCost: doc.data().shippingCost,
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
        db.collection('order').orderBy("idOrder", "desc").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(doc.id !== 'id') {          
                    data.push({
                        id : doc.id,
                        idOrder: doc.data().idOrder,
                        creator: doc.data().creator,
                        createDate: doc.data().createDate,
                        customer : doc.data().customer, 
                        blockScreen: doc.data().blockScreen,
                        detail: doc.data().detail,
                        number: doc.data().number,
                        pricePerPiece: doc.data().pricePerPiece,
                        totalPrice: doc.data().totalPrice,
                        deposit: doc.data().deposit,
                        deliveryDate: doc.data().deliveryDate,
                        note: doc.data().note,
                        shippingCost: doc.data().shippingCost,
                        status: doc.data().status
                    })
                }
            })
            res.status(200).send(data)
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

    let chk = validateOrderKey(data)
    if(!chk.status)
        res.status(400).send(chk.msg)

    db.collection('order').doc().set({
        idOrder: await getIdOrder(),
        creator: data.creator,
        createDate: data.createDate,
        customer : data.customer, 
        blockScreen: data.blockScreen,
        detail: data.detail,
        number: data.number,
        pricePerPiece: data.pricePerPiece,
        totalPrice: data.totalPrice,
        deposit: data.deposit,
        deliveryDate: data.deliveryDate,
        note: data.note,
        shippingCost: data.shippingCost,
        status: data.status
    }).then(() => {
        //แก้ใหม่ 22:44 29/4/2562
        increseIdOrder()
        res.status(200).send('Success')
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

    var docRef = db.collection("order").doc(req.query.id);
    return db.runTransaction((transaction) => {
        return transaction.get(docRef).then((doc) => {
            if (!doc.exists) {
                res.status(400).send("Document does not exist!")
            }
            transaction.update(docRef, {
                creator: data.creator,
                createDate: data.createDate,
                customer : data.customer, 
                blockScreen: data.blockScreen,
                detail: data.detail,
                number: data.number,
                pricePerPiece: data.pricePerPiece,
                totalPrice: data.totalPrice,
                deposit: data.deposit,
                deliveryDate: data.deliveryDate,
                note: data.note,
                shippingCost: data.shippingCost,
                status: data.status
            })
        })
    }).then(() => {
        res.status(200).send("Success")
    }).catch((err) => {
        console.log(err)
        res.status(400).send(err)
    })
})

app.delete('/',(req, res) => {
    if(typeof req.query.id === "undefined") {
        res.send(400).send("There are no id")
    }
    db.collection("order").doc(req.query.id).delete()
    .then(() => {
        res.status(200).send("Success : Delete")
    }).catch((err) => {
        res.status(400).send(err)
    })
})



module.exports = app
