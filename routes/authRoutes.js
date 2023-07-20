// import controllers
// set up three routes
const express = require('express')
const router = express.Router()

const {
    register,
    login,
    logout
} = require('../controllers/authController')


// post('/register') post('/login') get('/logout')

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)

module.exports = router;