const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const tokenApi = "CC80274793D170ADF2FE745398A9C458D81357557F89392203C0052CE4F99748";

const fabricRoll = require('./api_modules/fabricRoll')
const fabricType = require('./api_modules/fabricType')
const fabricColor = require('./api_modules/fabricColor')
const employee = require('./api_modules/employee')
const user = require('./api_modules/user')
const supplier = require('./api_modules/supplier')
const customer = require('./api_modules/customer')
const signin = require('./api_modules/signin')

const api = express();
api.use(cors());
api.use('/fabricroll',fabricRoll)
api.use('/fabrictype',fabricType)
api.use('/fabriccolor',fabricColor)
api.use('/supplier',supplier)
api.use('/employee',employee)
api.use('/customer',customer)
api.use('/user',user)
api.use('/signin',signin)

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

exports.api = functions.https.onRequest(api);
