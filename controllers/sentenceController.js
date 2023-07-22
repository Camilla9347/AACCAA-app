const Sentence = require('../models/Sentence');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const {getFirstPictogram} = require('../adapters/pictogramAdapter')

const getAllSentences = async (req,res) => {
    console.log(req.user)
    res.send('get all sentences')
    

}

const getSingleSentence = async (req,res) => {
    res.send('get single sentence')
   
}

const createSentence = async (req,res) => {
    
    const {subject, verb, object} = req.body
    if (!subject || !verb || !object){
        throw new CustomError.BadRequestError('Please provide subject, verb and object')
    }
    
    subjectPictogram = await getFirstPictogram(subject)
    verbPictogram = await getFirstPictogram(verb)
    objectPictogram = await getFirstPictogram(object)
    
    sentenceArray = new Array(subjectPictogram,verbPictogram,objectPictogram)

    
    res.status(StatusCodes.CREATED).json(sentenceArray)

}


const updateSentence = async (req,res) => {
    res.send('update sentence')
}

const deleteSentence = async (req,res) => {
    res.send('delete sentence')
}

module.exports = {
    getAllSentences,
    getSingleSentence,
    createSentence,
    updateSentence,
    deleteSentence
};