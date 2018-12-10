const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const firebaseApp2 = firebase.initializeApp(
    functions.config().firebase
);
var db = firebaseApp2.firestore();

module.exports = db