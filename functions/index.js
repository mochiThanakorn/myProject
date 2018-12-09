const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const tokenApi = "CC80274793D170ADF2FE745398A9C458D81357557F89392203C0052CE4F99748";

const fabricRoll = require('./api/fabricRoll')

function isJSON(str) {
    try {
        return (JSON.parse(str) && !!str);
    } catch (e) {
        return false;
    }
}

const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

app.use(cors());

const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

var db = firebaseApp.firestore();

const api = express();

api.use(cors());
api.use('/fabricroll',fabricRoll)

api.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

api.use((req, res, next) => {
    const auth = req.headers['auth']
    if(typeof auth!=='undefined' && auth==tokenApi) {
        next()
    } else {
        res.json({error:'Permission denied!'});
    }
})
api.post('/signin',(req, res) => {
    console.log("sign in");  
    if(req.body.username!="" && req.body.password!="") {
        var user = {
            username : req.body.username,
            password : req.body.password
        }
    } 
    else {
        var user = JSON.parse(req.body)
    } 
    console.log(user.username+" "+user.password)
    if (user.username && user.username=="" && user.password && user.password=="") {
        res.send("Username and Password is null.");
    } else if (user.username=="") {
        res.send("Username is null.");
    } else if (user.password=="") {
        res.send("Password is null.");
    }
    db.collection("users").where("username", "==",user.username).where("password", "==",user.password)
    .get()
    .then(docs => { 
        if (docs.empty) {
            res.status(401).json({error:"incorrect username or password"})
        } else {
            docs.forEach(function(doc) {
                    res.status(200).json({
                        id:doc.id,
                        name:doc.data().name,
                        surname:doc.data().surname,
                        typeAccount:doc.data().typeAccount,
                        authority:doc.data().authority
                    });          
            }) 
        }                   
    })
    .catch((error) => {
        res.json({errorMsg : error});
    });
})

//user
api.get('/user',(req, res) => {
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

api.put('/user',(req, res) => {
    //ถ้าไอดีไม่ตรงยังมีปัญหาอยู่
    //เพิ่มตรวจjson input
    if(typeof req.query.id !== "undefined") {
        if(typeof req.body == 'object') {
            var user = req.body
        }
        else {
            var user = JSON.parse(req.body)
        }
        var user = JSON.parse(req.body)
        var sfDocRef = db.collection("users").doc(req.query.id);
        return db.runTransaction(function(transaction) {
            return transaction.get(sfDocRef).then(function(sfDoc) {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                    //throw "Document does not exist!";
                }       
                transaction.update(sfDocRef, { 
                    username: user.username,
                    password: user.password,
                    idEmployee: user.idEmployee,
                    name: user.name,
                    surname: user.username,
                    registerDate: user.registerDate,
                    authority: user.authority
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
api.post('/user',(req, res) => {
    if(typeof req.body == 'object') {
        var user = req.body
    }
    else {
        var user = JSON.parse(req.body)
    }
    db.collection('users').doc().set({       
        username: user.username,
        password: user.password,
        idEmployee: user.idEmployee,
        name: user.name,
        surname: user.username,
        registerDate: user.registerDate,
        authority: user.authority       
    })
    res.status(200).send('Add user successful.');
});
api.delete('/user',(req, res) => {
    db.collection("users").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

//Employee
api.get('/employee',(req, res) => {
    var employeeArr = [];
    if(typeof req.query.id !== "undefined") {
        db.collection('employee').doc(req.query.id).get()
        .then((doc) => {
            if (doc.exists) {
                res.json({
                    id : doc.id,
                    name : doc.data().name,
                    surname : doc.data().surname,
                    sex : doc.data().sex,
                    position : doc.data().position,
                    birthday : doc.data().birthday,
                    address : doc.data().address,
                    phoneNumber : doc.data().phoneNumber,
                    firstDayOfWork : doc.data().firstDayOfWork
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
        db.collection('employee').where('name', '==', req.query.name).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
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
            });
            res.status(200).send(employeeArr);
        })
        .catch((err) => {
            res.status(401).json({error:err});
        });
    }
    else {
        db.collection('employee').orderBy("name").orderBy("surname").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                employeeArr.push({
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
            });
            res.status(200).send(employeeArr);
        })
        .catch((err) => {
            console.log("Error to get all employees.")
            res.status(401).json({error:err});
        });
    }
});

api.put('/employee',(req, res) => {
    //ถ้าไอดีไม่ตรงยังมีปัญหาอยู่
    //เพิ่มตรวจjson input
    if(typeof req.query.id !== "undefined") {
        if(req.body.name!="" && req.body.surname!="" && req.body.sex!="" && req.body.birthday!="" && req.body.position!="" && req.body.address!="" && req.body.phoneNumber!="" && req.body.firstDayOfWork!="") {
            var user = req.body
        } 
        else {
            var user = JSON.parse(req.body)
        }
        var sfDocRef = db.collection("employee").doc(req.query.id);
        return db.runTransaction(function(transaction) {
            return transaction.get(sfDocRef).then(function(sfDoc) {
                if (!sfDoc.exists) {
                    res.status(404).json({error : "Document does not exist!"})
                    //throw "Document does not exist!";
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
api.post('/employee',(req, res) => {
    // add feature console log check data when data is undefined
    if(req.body.name!="" && req.body.surname!="" && req.body.sex!="" && req.body.birthday!="" && req.body.position!="" && req.body.address!="" && req.body.phoneNumber!="" && req.body.firstDayOfWork!="") {
        var user = req.body
    } 
    else {
        var user = JSON.parse(req.body)
    } 
    var docRef = db.collection('employee').doc();
    var setAda = docRef.set({       
        name: user.name,
        surname: user.surname,
        sex: user.sex,
        birthday: user.birthday,
        position: user.position,
        address: user.address,
        phoneNumber: user.phoneNumber,
        firstDayOfWork: user.firstDayOfWork 
    })
    res.status(200).send('Add complete');
});
api.delete('/employee',(req, res) => {
    db.collection("employee").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

//Supplier
api.get('/supplier',(req, res) => {
    var employeeArr = [];
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
                res.send("No such document!");
            }
        })
    .catch((err) => {
        res.status(401).send('Error getting documents', err);
    });
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

api.put('/supplier',(req, res) => {
    //ถ้าไอดีไม่ตรงยังมีปัญหาอยู่
    //เพิ่มตรวจjson input
    if(typeof req.query.id !== "undefined") {
        if(typeof req.body == 'object') {
            var data = req.body
        }
        else {
            var data = JSON.parse(req.body)
        }
        console.log(data)
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
api.post('/supplier',(req, res) => {
    // add feature console log check data when data is undefined
    if(typeof req.body == 'object') {
        var data = req.body
    } 
    else {
        var data = JSON.parse(req.body)
    } 
    console.log(data)
    var docRef = db.collection('supplier').doc();
    var setAda = docRef.set({       
        name : data.name,
        phoneNumber : data.phoneNumber, 
        address : data.address,        
        note : data.note 
    })
    res.status(200).send('Add complete');
});
api.delete('/supplier',(req, res) => {
    db.collection("supplier").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

//Customer
api.get('/customer',(req, res) => {
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

api.put('/customer',(req, res) => {
    //ถ้าไอดีไม่ตรงยังมีปัญหาอยู่
    //เพิ่มตรวจjson input
    if(typeof req.query.id !== "undefined") {
        if(typeof req.body == 'object') {
            var data = req.body
        }
        else {
            var data = JSON.parse(req.body)
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
api.post('/customer',(req, res) => {
    // add feature console log check data when data is undefined
    if(typeof req.body == 'object') {
        var data = req.body
    } 
    else {
        var data = JSON.parse(req.body)
    } 
    console.log(data)
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
api.delete('/customer',(req, res) => {
    db.collection("customer").doc(req.query.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

exports.api = functions.https.onRequest(api);
exports.app = functions.https.onRequest(app);
