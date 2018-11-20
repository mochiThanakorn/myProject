const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const tokenApi = "CC80274793D170ADF2FE745398A9C458D81357557F89392203C0052CE4F99748";

const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

app.use(cors());

//แก้ปัญหา CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

var db = firebaseApp.firestore();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//web routing
app.get('/',(req, res) => {
    var strJson = '[';
    var state = 'y';
    db.collection('users').get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(state=='y') {
                    strJson+=JSON.stringify(doc.data());
                    state='n';
                }
                else {
                    strJson+=','+JSON.stringify(doc.data());
                }
            });
            strJson+=']';
            var users = JSON.parse(strJson);
            res.render('index', { users });
        })
    .catch((err) => {
        res.send('Error getting documents', err);
    });
});

app.post('/singin',(req, res, next) => {
    var userJson = JSON.parse(req.body);
    jwt.sign({userJson},'secretkey',(err, token) => {
        if(err) {
            res.send(err);
        } else {
            res.json({
                token
            });
        }  
    });
});

app.get('/singout',(req, res) => {
    res.send('<b>Sing out</b>');
});
app.get('/singup',(req, res) => {
    res.send('<b>Sing up</b>');
}); 

app.post('/home', verifyToken,(req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            res.sendStatus(403);    
        } else {
            res.json({
                message: 'Hello',
                authData
            });
        }
    });
});

function verifyToken(req,res,next) {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

app.delete('/home', verifyToken,(req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            res.sendStatus(403);    
        } else {
            res.json({
                message: 'Delete success',
                authData
            });
        }
    });
});



//web api
app.get('/user/id/:id',(req, res) => {
    db.collection('users').doc(req.params.id).get()
        .then((doc) => {      
            var strJson = '{'; 
            strJson += '"Id":"'+doc.id+'"';
            strJson+=',"Name":"'+doc.data().Name+'"';
            strJson+=',"Surname":"'+doc.data().Surname+'"';
            strJson+=',"Age":'+doc.data().Age+'}';
            res.send(strJson);
        })
    .catch((err) => {
        res.send('Error getting documents', err);
    });
});

app.get('/user/name/:name',(req, res) => {
    var strJson = '[';
    var state = 'y';
    db.collection('users').where('Name', '==', req.params.name).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(state=='y') {
                    strJson+=JSON.stringify(doc.data());
                    state='n';
                }
                else {
                    strJson+=','+JSON.stringify(doc.data());
                }
            });
            strJson+=']';
            res.send(strJson);
        })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});

app.get('/user/surname/:surname',(req, res) => {
    var strJson = '[';
    var state = 'y';
    db.collection('users').where('Surname', '==', req.params.surname).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(state=='y') {
                    strJson+=JSON.stringify(doc.data());
                    state='n';
                }
                else {
                    strJson+=','+JSON.stringify(doc.data());
                }
            });
            strJson+=']';
            res.send(strJson);
        })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});

app.get('/user/age/equal/:age',(req, res) => {
    var strJson = '[';
    var state = 'y';
    db.collection('users').where('Age', '==', parseInt(req.params.age)).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(state=='y') {
                    strJson+=JSON.stringify(doc.data());
                    state='n';
                }
                else {
                    strJson+=','+JSON.stringify(doc.data());
                }
            });
            strJson+=']';
            res.send(strJson);
        })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});

app.get('/user/age/morethan/:age',(req, res) => {
    var strJson = '[';
    var state = 'y';
    db.collection('users').where('Age', '>', parseInt(req.params.age)).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(state=='y') {
                    strJson+=JSON.stringify(doc.data());
                    state='n';
                }
                else {
                    strJson+=','+JSON.stringify(doc.data());
                }
            });
            strJson+=']';
            res.send(strJson);
        })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});

app.get('/user/age/lessthan/:age',(req, res) => {
    var strJson = '[';
    var state = 'y';
    db.collection('users').where('Age', '<', parseInt(req.params.age)).get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(state=='y') {
                    strJson+=JSON.stringify(doc.data());
                    state='n';
                }
                else {
                    strJson+=','+JSON.stringify(doc.data());
                }
            });
            strJson+=']';
            res.send(strJson);
        })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});

const api = express();

api.use(cors());

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
    var user = JSON.parse(req.body);
    if (user.username=="" && user.password=="") {
        res.send("Username and Password is null.");
    } else if (user.username=="") {
        res.send("Username  is null.");
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
api.post('/signout',(req, res) => {
    var user = JSON.parse(req.body); 
    db.collection("users").where("username", "==",user.username)
    .get()
    .then(docs => {
        docs.forEach(function(doc) {
            str = '{'+doc.id+" => "+doc.data()+'}';
            res.send(str)
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
})
api.get('/user/id/:id',(req, res) => {
    db.collection('users').doc(req.params.id).get()
        .then((doc) => {      
            strJson+='{"id":'+JSON.stringify(doc.id);
            strJson+=',"name":'+JSON.stringify(doc.data().name);
            strJson+=',"surname":'+JSON.stringify(doc.data().surname);
            if(doc.data().birthday != undefined)
                strJson+=',"birthday":'+JSON.stringify(doc.data().birthday);
            else
                strJson+=',"birthday":"0000-00-00 00:00:00"';
            strJson+=',"position":'+JSON.stringify(doc.data().position);
            strJson+=',"address":'+JSON.stringify(doc.data().address);
            strJson+=',"phoneNumber":'+JSON.stringify(doc.data().phoneNumber);
            if(doc.data().firstDayOfWork != undefined)
                strJson+=',"firstDayOfWork":'+JSON.stringify(doc.data().firstDayOfWork);
            else
                strJson+=',"firstDayOfWork":"0000-00-00 00:00:00"';
            strJson+=',"username":'+JSON.stringify(doc.data().username);
            strJson+=',"password":'+JSON.stringify(doc.data().password);
            strJson+=',"typeAccount":'+JSON.stringify(doc.data().typeAccount);
            strJson+=',"authority":'+JSON.stringify(doc.data().authority)+'}';        
            res.send(strJson);
        })
    .catch((err) => {
        res.send('Error getting documents', err);
    });
});
api.get('/users',(req, res) => {
    var strJson = '[';
    var state = 'y';
    db.collection('users').get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if(state=='y') {
                    strJson+='{"id":'+JSON.stringify(doc.id);
                    strJson+=',"name":'+JSON.stringify(doc.data().name);
                    strJson+=',"surname":'+JSON.stringify(doc.data().surname);
                    if(doc.data().birthday != undefined)
                        strJson+=',"birthday":'+JSON.stringify(doc.data().birthday);
                    else
                        strJson+=',"birthday":"0000-00-00 00:00:00"';
                    strJson+=',"position":'+JSON.stringify(doc.data().position);
                    strJson+=',"address":'+JSON.stringify(doc.data().address);
                    strJson+=',"phoneNumber":'+JSON.stringify(doc.data().phoneNumber);
                    if(doc.data().firstDayOfWork != undefined)
                        strJson+=',"firstDayOfWork":'+JSON.stringify(doc.data().firstDayOfWork);
                    else
                        strJson+=',"firstDayOfWork":"0000-00-00 00:00:00"';
                    strJson+=',"username":'+JSON.stringify(doc.data().username);
                    strJson+=',"password":'+JSON.stringify(doc.data().password);
                    strJson+=',"typeAccount":'+JSON.stringify(doc.data().typeAccount);
                    strJson+=',"authority":'+JSON.stringify(doc.data().authority)+'}';
                    state='n';
                }
                else {
                    strJson+=',{"id":'+JSON.stringify(doc.id);
                    strJson+=',"name":'+JSON.stringify(doc.data().name);
                    strJson+=',"surname":'+JSON.stringify(doc.data().surname);
                    if(doc.data().birthday != undefined)
                        strJson+=',"birthday":'+JSON.stringify(doc.data().birthday);
                    else
                        strJson+=',"birthday":"0000-00-00 00:00:00"';
                    strJson+=',"position":'+JSON.stringify(doc.data().position);
                    strJson+=',"address":'+JSON.stringify(doc.data().address);
                    strJson+=',"phoneNumber":'+JSON.stringify(doc.data().phoneNumber);
                    if(doc.data().firstDayOfWork != undefined)
                        strJson+=',"firstDayOfWork":'+JSON.stringify(doc.data().firstDayOfWork);
                    else
                        strJson+=',"firstDayOfWork":"0000-00-00 00:00:00"';
                    strJson+=',"username":'+JSON.stringify(doc.data().username);
                    strJson+=',"password":'+JSON.stringify(doc.data().password);
                    strJson+=',"typeAccount":'+JSON.stringify(doc.data().typeAccount);
                    strJson+=',"authority":'+JSON.stringify(doc.data().authority)+'}';
                }
            });
            strJson+=']';
            res.send(strJson);
        })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});
api.put('/user',(req, res) => {
    //ถ้าไอดีไม่ตรงยังมีปัญหาอยู่
    //เพิ่มตรวจjson input
    var user = JSON.parse(req.body);
    var sfDocRef = db.collection("users").doc(user.id);
    return db.runTransaction(function(transaction) {
        return transaction.get(sfDocRef).then(function(sfDoc) {
            if (!sfDoc.exists) {
                throw "Document does not exist!";
            }       
            transaction.update(sfDocRef, { 
                name : user.name, 
                surname : user.surname, 
                birthday : user.birthday,
                position : user.position,
                address : user.address,
                phoneNumber : user.phoneNumber,
                firstDayOfWork : user.firstDayOfWork,
                username : user.username,
                password : user.password,
                typeAccount : user.typeAccount,
                authority : user.authority
            });
        });
    }).then(function() {
        res.send("Transaction successfully committed!");
    }).catch(function(error) {
        res.send("Transaction failed: ", error);
    });
});
api.post('/user',(req, res) => {
    // add feature console log check data when data is undefined
    var user = JSON.parse(req.body);
    var docRef = db.collection('users').doc();
    var setAda = docRef.set({       
        name: user.name,
        surname: user.surname,
        birthday: user.birthday,
        position: user.position,
        address: user.address,
        phoneNumber: user.phoneNumber,
        firstDayOfWork: user.firstDayOfWork,
        username: user.username,
        password: user.password,
        typeAccount: user.typeAccount,
        authority: user.authority  
    })
    res.send('Add complete');
});
api.delete('/user',(req, res) => {
    var userObj = JSON.parse(req.body);
    db.collection("users").doc(userObj.id).delete().then(function() {
        res.send("Document successfully deleted!");
    }).catch(function(error) {
        res.send("Error removing document: ", error);
    });
});

//Employee
api.get('/employee/id/:id',(req, res) => {
    db.collection('employee').doc(req.params.id).get()
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
});
api.get('/employee',(req, res) => {
    var json = [];
    db.collection('employee').get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                json.push({
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
            res.status(200).send(json);
        })
    .catch((err) => {
        res.status(401).json({error:err});
    });
});
api.put('/employee/:id',(req, res) => {
    //ถ้าไอดีไม่ตรงยังมีปัญหาอยู่
    //เพิ่มตรวจjson input
    var user = JSON.parse(req.body);
    var sfDocRef = db.collection("employee").doc(req.params.id);
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
});
api.post('/employee',(req, res) => {
    // add feature console log check data when data is undefined
    var user = JSON.parse(req.body);
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
api.delete('/employee/:id',(req, res) => {
    db.collection("employee").doc(req.params.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

//fabric roll
api.get('/fabricrolls',(req, res) => {
    res.status(200).json([{
        id : "tFhPoMEdDPaatDz64alN",
        idFabricType : "sDf5g4G655dfs",
        idFabricColor : "a5fdg5dad87r56",
        size : "50",
        weight : "3"
    },{
        id : "bzgwRNd9ouu9pFndXnk3",
        idFabricType : "dfgQ7dg56fsffd",
        idFabricColor : "F5df6gd5ghjf6h",
        size : "60",
        weight : "6"
    }]);
});
api.put('/fabricroll',(req, res) => {
    res.status(200);
});
api.post('/fabricroll',(req, res) => {
    // add feature console log check data when data is undefined
    var user = JSON.parse(req.body);
    var docRef = db.collection('fabricrolls').doc();
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
api.delete('/fabricroll/:id',(req, res) => {
    db.collection("fabricrolls").doc(req.params.id).delete().then(function() {
        res.status(200).send("Document successfully deleted!");
    }).catch(function(error) {
        res.status(401).send("Error removing document: ", error);
    });
});

exports.api = functions.https.onRequest(api);
exports.app = functions.https.onRequest(app);
//exports.api = functions.https.onRequest((req,res) => {api_user.router(req,res)});