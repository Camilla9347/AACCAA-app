const express = require('express')
const router = express.Router()


const {
    getPictogram
} = require('../controllers/pictogramController')


router.route('/:string').get(getPictogram)

module.exports = router;