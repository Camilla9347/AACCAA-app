const {createJWT, isTokenValid, attachCookiesToResponse} = require('./jwt')
const { getFirstPictogram, compareAndUpdatePictogram} = require('./pictogram')
const  { compareAndUpdateSentence } = require('./sentence')

module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
    getFirstPictogram, 
    compareAndUpdatePictogram,
    compareAndUpdateSentence, 
}