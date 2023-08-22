// import controllers
// set up two routes
const express = require('express')
const router = express.Router()


const {
    getAllSentences,
    getSingleSentence,
    createSentence,
    updateSentence,
    deleteSentence
} = require('../controllers/sentenceController')


router.route('/').get(getAllSentences).post(createSentence)
router.route('/:id').get(getSingleSentence).patch(updateSentence).delete(deleteSentence)

module.exports = router;