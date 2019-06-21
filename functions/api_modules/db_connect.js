const functions = require('firebase-functions')
const firebase = require('firebase-admin')
const firebaseApp = firebase.initializeApp(
    functions.config().firebase
)
const db = firebaseApp.firestore()

module.exports = db