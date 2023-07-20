const jwt = require('jsonwebtoken')

// create jwt
const createJWT = ({ payload }) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_LIFETIME,
    });
    return token;
};

// verify jwt
const isTokenValid = ({token}) =>{
    jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
    createJWT,
    isTokenValid,
}