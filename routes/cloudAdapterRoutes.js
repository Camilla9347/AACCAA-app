const express = require('express')
const router = express.Router()

const {
    getCloudObject
    
} = require('../adapters/cloudAdapter')


router.route('/').get(getCloudObject)
module.exports = router;