// User model from MongoDB
const User = require('../models/User')
// Custom Error
const {StatusCodes} = require('http-status-codes')
// exporting from index.js
const CustomError = require('../errors')
// require 'jsonwebtoken' package -> now in utils
const { attachCookiesToResponse } = require('../utils')


// Register Controller
// create user
const register = async (req, res) => {
     // check if email already in use (schema and controller)
    const {email} = req.body;
    const emailAlreadyExists = await User.findOne({email})
    if(emailAlreadyExists){
        throw new CustomError.BadRequestError('Email already exists')
    }
    const user = await User.create({...req.body});
    
    // to protect password, used as payload
    const tokenUser = {name:user.name, userID:user._id};
    
    attachCookiesToResponse({ res, user: tokenUser });
   
    
    // 3 send response with tokenUser and token
    res.status(StatusCodes.CREATED).json({user: tokenUser})
    //2 send response with entire user (only while testing)
    //res.status(StatusCodes.CREATED).json({user})
    // 1 res.send('some string value')
    //res.send('register user')
}

const login = async (req, res) => {
    res.send('login user')
}

const logout = async (req, res) => {
    res.send('logout user')
}

//export (register,login,logout) functions
module.exports = {
    register,
    login,
    logout
}