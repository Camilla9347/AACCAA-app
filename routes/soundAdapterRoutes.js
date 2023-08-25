const express = require('express')
const router = express.Router()

const {
    getSound
} = require('../adapters/soundAdapter')


router.route('/').get(getSound);
module.exports = router;