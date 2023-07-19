// create models folder and User.js file
// create schema with name, email, password (all type:String)
const mongoose = require('mongoose')
const validator = require('validator')

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please provide name'], 
        minLength: 3,
        maxLength: 50,
    },
    email:{
        type:String,
        required:[true, 'Please provide email'],
        // not use match options
        // use mongoose custom validators + validator package
        validate:{
            validator: validator.isEmail,
            message: 'Please provide valid email',
        }
    },
    password:{
        type:String,
        required:[true, 'Please provide password'],
        minLength: 6,
    },
    role:{
        type:String,
        enum:['admin', 'user'],
        default: 'user',
    }
    // leave admin option open
})
//export mongoose model
module.exports = mongoose.model('User', UserSchema)