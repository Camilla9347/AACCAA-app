// User model from MongoDB
const User = require('../models/User')
// Custom Error
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
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

    // create/add User to the User collection of the database
    // following moongose User schema (directly from req.body)
    const user = await User.create({...req.body});
    
    const tokenUser = {name:user.name, userId:user._id};
    
    attachCookiesToResponse({ res, user: tokenUser });
   
    res.status(StatusCodes.CREATED).json({user: tokenUser})
}

const login = async (req, res) => {
    // check if email and password exist, if one missing return 400
    const {email,password}= req.body
    if (!email || !password){
        throw new CustomError.BadRequestError('Please provide email and password')
    }
    // find user, if no user return 401
    const user = await User.findOne({email});
    if(!user){
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    //check password, if does not match return 401
    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    // if everything is correct, attach cookie
    // and send back the same response as in register
    const tokenUser = {name:user.name, userId:user._id};
    attachCookiesToResponse({ res, user: tokenUser });
    //send response with tokenUser
    res.status(StatusCodes.CREATED).json({user: tokenUser})

}

const logout = async (req, res) => {
    
    // remember cookies have a size limit, are not stored anywhere
    // httpOnly, nobody can access them
    // cookies can be sent back and forth from the same domain!
    // remove cookie from browser
    res.cookie('token', 'logout', {
        httpOnly:true,
        expires: new Date(Date.now()),
    });
    
    res.status(StatusCodes.OK).json({msg:'user logged out!'});
}

//export (register,login,logout) functions
module.exports = {
    register,
    login,
    logout
}