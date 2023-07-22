const mongoose = require('mongoose')
const validator = require('validator')
// Hash passwords
const bcrypt = require('bcryptjs')

const SentenceSchema = new mongoose.Schema({
    sentence: Array,
    /*
    [
            { id: Number, subject: String, imageUrl: String},
            { id: Number, verb: String, imageUrl: String}, 
            { id: Number, object: String, imageUrl: String} 
    ],*/
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref: 'User',
        required:[true, 'Please provide user']
    }
},{timestamps:true});



//export mongoose model
module.exports = mongoose.model('Sentence', SentenceSchema)