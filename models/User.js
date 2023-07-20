// create models folder and User.js file
// create schema with name, email, password (all type:String)
const mongoose = require('mongoose')
const validator = require('validator')
// Hash passwords
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please provide name'], 
        minLength: 3,
        maxLength: 50,
    },
    email:{
        type:String,
        // check if email already in use (schema and controller)
        required:[true, 'Please provide email'],
        // not use match options
        // use mongoose custom validators + validator package
        validate:{
            validator: validator.isEmail,
            message: 'Please provide valid email',
        },
        unique:true,
    },
    password:{
        type:String,
        required:[true, 'Please provide password'],
        minLength: 6,
    },
});

// to handle passwords
// UserSchema.pre('save') - hook
// this points back to the User
UserSchema.pre('save', async function(){
    // bcrypt.genSalt - 10 is the number of rounds
    const salt = await bcrypt.genSalt(10)
    // bcrypt.hash
    this.password = await bcrypt.hash(this.password,salt); 
});

UserSchema.methods.comparePassword = async function(candidatePassword){
    // bcrypt.compare
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch;
}

//export mongoose model
module.exports = mongoose.model('User', UserSchema)