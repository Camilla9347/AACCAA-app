const express = require('express')
const router = express.Router()


const {
    getAllSentences,
    getSingleSentence,
    createSentence,
    updateSentence,
    deleteSentence
} = require('../controllers/sentenceController')

// not sure about post CreateSentence, it may be a searchSentence so get with queryString
router.route('/').get(getAllSentences).post(createSentence)
router.route('/:id').get(getSingleSentence).patch(updateSentence).delete(deleteSentence)


module.exports = router;