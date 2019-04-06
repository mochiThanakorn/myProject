const express = require('express');
const app = express();
const db = require('./db_connect');

//functions check is a valid json
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
            msg : "not json format",
            data : {}
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
    if(!data.birthday) {
        error_msg += "birthday,"
        error_chk = true
    }
    if(!data.position) {
        error_msg += "position,"
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
    if(!data.firstDayOfWork) {
        error_msg += "firstDayOfWork,"
        error_chk = true
    }
    if(error_chk) {
        error_msg += "]"
        return {
            status : 2,
            msg : error_msg,
            data : {}
        }
    }
    return {
        status : 3,
        msg : "field are valid",
        data : data
    }
}
const queryFirestore = () => {
    db.collection('employee')
    .doc(doc.data().idEmployee)
    .get()
    .then((emp) => {
        if (emp.exists) {
            console.log("emp.id = ",emp.id)          
            data.push(emp.id)
            console.log(data)
        } 
        else {
            console.log("no emp = ")
        }
    })
    .catch((err) => {
        console.log(err)
        res.status(401).json({msg : err});
    })
    res.status(200).send(data);
}

app.get('/test',(req,res) => {
    queryFirestore()
})

app.get('/isuser', (req,res) => {
    console.log("employee/isnotuser")
    var data = []
    db.collection('users')
    .get()
    .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
            console.log("start loop")
            db.collection('employee')
            .doc(doc.data().idEmployee)
            .get()
            .then((emp) => {
                if (emp.exists) {
                    console.log("emp.id = ",emp.id)          
                    data.push(emp.id)
                    console.log(data)             
                } 
                else {
                    console.log("no emp = ")
                }
            })
            .catch((err) => {          
                console.log(err)
                res.status(401).json({msg : err});
            }) 
        })
        console.log("run finish.")
        res.status(200).send(data);
    })   
    .catch((err) => {
        console.log(err)
        res.status(401).json({msg : err});
    })   
})
/*const test = async (id) => {
    var empDoc = db.collection('employee').doc(id)
            var emp = await empDoc.get()
            
            //.then((emp) => {
                if (emp.exists) {
                    console.log("emp.id = ",emp.id)          
                    data.push(emp.id)
                    console.log(data)             
                } 
                else {
                    console.log("no emp = ")
                }    
}*/
app.get('/isnotuser', (req,res) => {
    console.log("employee/isnotuser")
    var data = []
    var j = 0,chk = 0;
    db.collection('users')
    .get()
    .then( (snapshot) => {
        var length = snapshot.size;
        console.log(length)
        snapshot.docs.forEach( (doc,i,arr) => {
           
            console.log("start loop")
            db.collection('employee')
            .doc(doc.data().idEmployee)
            .get()
            .then((emp) => {
                if (emp.exists) {
                    console.log("emp.id = ",emp.id)          
                    data.push(emp.id)
                    console.log(data)             
                } 
                else {
                    console.log("no emp = ")
                }
               /* j++
                if(j == arr.length)
                    chk = 1*/
            })
            .catch((err) => {          
                console.log(err)
                res.status(401).json({msg : err});
            }) 
        })
        console.log("run finish.")
        while(data.length < length);
        console.log("real finish")
        res.status(200).send(data);
    })   
    .catch((err) => {
        console.log(err)
        res.status(401).json({msg : err});
    })   
})

/*app.get('/isuser',(req,res) => {
    var data = []
    db.collection('employee').orderBy("name").orderBy("surname").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                console.log("search user 1 = ",doc.id)
                db.collection('users').where("idEmployee","==",doc.id).get()
                .then((user) => {
                    console.log("search user 2 = ",doc.id)
                    if (user.exists) {
                        console.log("have user",user)
                        data.push(doc)
                        console.log(data)
                    } else {
                        console.log("don't have user",user)
                    }
                })
                .catch((err) => {
                    res.status(401).send('Error getting documents', err)
                })
            });
            res.status(200).send(data);
        })
        .catch((err) => {
            console.log("Error to get all employees.")
            res.status(401).json({msg : err});
        });
})*/

app.get('/',(req, res) => {
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
                res.json({msg:"No such document!"});
            }
        })
    .catch((err) => {
        res.status(401).json({msg:'Error getting documents'+err});
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
            res.status(401).json({msg : err});
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
            res.status(401).json({msg : err});
        });
    }
});

app.put('/',(req, res) => {
    if(typeof req.query.id !== "undefined") {
        if(typeof req.body == 'object') {
            var user = req.body
        } 
        else {
            var user = JSON.parse(req.body)
        }
        var sfDocRef = db.collection("employee").doc(req.query.id);
        return db.runTransaction(function(transaction) {
            return transaction.get(sfDocRef).then(function(sfDoc) {
                if (!sfDoc.exists) {
                    res.status(404).json({msg : "Document does not exist!"})
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
        }).then(() => {
            res.status(200).json({msg : "Successfully updated."})
        }).catch((error) => {
            res.status(401).json({msg : error})
        });
    }
    else {
        res.send(401).json({msg : "not found id"})
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
    if(!data.birthday) {
        error_msg += "birthday,"
        error_chk = true
    }
    if(!data.position) {
        error_msg += "position,"
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
    if(!data.firstDayOfWork) {
        error_msg += "firstDayOfWork,"
        error_chk = true
    }
    if(error_chk) {
        error_msg += "]"
        res.status(400).json({msg:error_msg})
    }
    db.collection('employee').doc().set({       
        name: data.name,
        surname: data.surname,
        sex: data.sex,
        birthday: data.birthday,
        position: data.position,
        address: data.address,
        phoneNumber: data.phoneNumber,
        firstDayOfWork: data.firstDayOfWork 
    })
    res.status(200).json({msg:'Successfully added.'});
});
app.delete('/',(req, res) => {
    db.collection("employee").doc(req.query.id).delete().then(function() {
        console.log("ลบพนักงาน")
        var user
        db.collection('users').where('idEmployee', '==', req.query.id).get()
            .then((doc) => {
                if (doc.exists) {
                    console.log("เจอผู้ใช้")
                    user = {id : doc.id}
                    db.collection("users").doc(user.id).delete().then(function() {
                        console.log("ลบผู้ใช้")
                        res.status(200).send("Document successfully deleted!");
                    }).catch(function(error) {
                        res.status(401).send("Error removing document: ", error);
                    });
                }         
            })
        .catch((err) => {
            res.status(401).send('Error getting documents', err);
        });      
        res.status(200).json({msg:"Document successfully deleted!"});
    }).catch(function(error) {
        res.status(401).json({msg:"Error removing document: "+error});
    });
});

module.exports = app