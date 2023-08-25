const express = require('express')
const router = express.Router()

const {
    getImage
} = require('../adapters/imageAdapter')


router.route('/').get(getImage);
module.exports = router;