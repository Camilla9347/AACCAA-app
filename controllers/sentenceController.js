const Sentence = require('../models/Sentence');
const Pictogram = require('../models/Pictogram');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const {getFirstPictogram, compareAndUpdatePictogram} = require('./pictogramController')

const getAllSentences = async (req,res) => {
    const sentences = await Sentence.find({createdBy:req.user.userId}).sort('createdAt')
    res.status(StatusCodes.OK).json({sentences, count: sentences.length})
    

}

const getSingleSentence = async (req,res) => {
    const {user: {userId}, params: {id: sentenceId}} = req
        //res.send('get single sentence')
    const sentence = await Sentence.findOne({
        _id:sentenceId,
        createdBy: userId
    });
    if(!sentence){
        throw new CustomError.NotFoundError(`No sentence with id ${sentenceId}`)
    }
    res.status(StatusCodes.OK).json({sentence})
}

const createSentence = async (req,res) => {
    
    const {language, subject, verb, object} = req.body
    if (!language || !subject || !verb || !object){
        throw new CustomError.BadRequestError('Please provide language, subject, verb and object')
    }
    
    const subjectPictogram = await getFirstPictogram(language,{subject})
    const verbPictogram = await getFirstPictogram(language,{verb})
    const objectPictogram = await getFirstPictogram(language,{object})
    
    
    sentenceArray = new Array(subjectPictogram,verbPictogram,objectPictogram)
   
    req.body.createdBy = req.user.userId
    req.body.structure =  sentenceArray
    
    const sentenceAlreadyExists = await Sentence.findOne({ structure: sentenceArray, createdBy:req.user.userId})
    if(!sentenceAlreadyExists){
        const sentence = await Sentence.create(req.body);
        res.status(StatusCodes.CREATED).json({sentence})
    } else {
        res.status(StatusCodes.CONFLICT).send('Duplicated sentence, please create a different one')
    }
}


const updateSentence = async (req,res) => {
    
    const {
        body:{subject,verb,object},
        user: {userId}, 
        params: {id: sentenceId}
    } = req
    

    if (subject==='' || verb==='' || object===''){
        throw new CustomError.BadRequestError('subject, verb, or object fields cannot be empty')

    }

    const sentence = await Sentence.findOne({
        _id:sentenceId,
        createdBy: userId
    });

    if(!sentence){
        throw new CustomError.NotFoundError(`No sentence with id: ${sentenceId}`)
    }


    const newSubject = await compareAndUpdatePictogram(sentence, "subject", subject)
    const newVerb = await compareAndUpdatePictogram(sentence, "verb", verb)
    const newObject= await compareAndUpdatePictogram(sentence, "object", object)
    
    // codice triplicato -> funzione?
    if (!(Object.keys(newSubject).length ===0)){
        foundIndex = sentence.structure.findIndex(item => item.sentencePart === "subject");
        sentence.structure[foundIndex] = newSubject

    }
    if (!(Object.keys(newVerb).length ===0)){
        foundIndex = sentence.structure.findIndex(item => item.sentencePart === "verb");
        sentence.structure[foundIndex] = newVerb

    }
    if (!(Object.keys(newObject).length ===0)){
        foundIndex = sentence.structure.findIndex(item => item.sentencePart === "object");
        sentence.structure[foundIndex] = newObject
    }
    
    // updates only if different
    const updatedDbSentence = await Sentence.findByIdAndUpdate(
        {
            _id:sentenceId,
            createdBy: userId
        },
        sentence,
        {new:true, runValidators:true}
    
    ) 
    res.status(StatusCodes.OK).json(updatedDbSentence)
}


// cancelli la frase ma non i pittogrammi
const deleteSentence = async (req,res) => {
    const {
        user: {userId}, 
        params: {id: sentenceId}
    } = req
    const sentence = await Sentence.findByIdAndRemove({
        _id:sentenceId,
        createdBy:userId
    })
    if(!sentence){
        throw new CustomError.NotFoundError(`No sentence with id: ${sentenceId}`)
    }
    res.status(StatusCodes.OK).send()
}

module.exports = {
    getAllSentences,
    getSingleSentence,
    createSentence,
    updateSentence,
    deleteSentence
};