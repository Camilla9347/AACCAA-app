const CustomError = require('../errors')
const { isTokenValid } = require('../utils')

const authenticateUser = async (req,res,next) =>{
    const token = req.signedCookies.token;

    if(!token){
        throw new CustomError.UnauthenticatedError('Authentication Invalid')
    } 
    try {
        const {name, userId} = isTokenValid({ token }) // payload
        req.user = {name,userId};
        next();
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid')
    }
}

module.exports = {
    authenticateUser,
}