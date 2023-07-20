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
};

const attachCookiesToResponse = ({ res, user }) => {
    const token = createJWT({ payload: user });
  
    const oneDay = 1000 * 60 * 60 * 24;
    
    // while testing use http
    // in production use https
    res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + oneDay),
      secure:process.env.NODE_ENV === 'production',
      signed: true,

    });
  };


module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
}