const express = require('express')
const app = express()
const db = require('./db_connect')
const firebase = require('firebase-admin')

// token application
const tokenApi = "CC80274793D170ADF2FE745398A9C458D81357557F89392203C0052CE4F99748"

app.use((req, res, next) => {
    //check authority app
    const auth = req.header('auth')
    if(typeof auth !== 'undefined' && auth == tokenApi) {
        next()
    } else {
        res.status(400).json({ msg: 'Error : Permission application denied!' })
    }
})

module.exports = app