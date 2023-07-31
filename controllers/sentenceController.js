const Sentence = require('../models/Sentence');
const Pictogram = require('../models/Pictogram');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const {getFirstPictogram} = require('../adapters/pictogramAdapter')

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
    
    
    sentenceArray = new Array(subjectPictogram,verbPictogram, objectPictogram)
   
    req.body.createdBy = req.user.userId
    req.body.structure =  sentenceArray
    // se metto sempre la stessa frase la prende, visto che è una post diversa
    const sentence = await Sentence.create(req.body);
    
    res.status(StatusCodes.CREATED).json({sentence})
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
    
    const updatedSentence = await compareAndUpdateSentence(sentence, subject,verb,object)
    

    const updatedDbSentence = await Sentence.findByIdAndUpdate(
        {
            _id:sentenceId,
            createdBy: userId
        },
        updatedSentence,
        {new:true, runValidators:true}
    
    ) 
    res.status(StatusCodes.OK).json(updatedDbSentence)
}

// to be moved in utils
const compareAndUpdateSentence = async (sentence, subject, verb, object) => {
    if(sentence["sentence"][0].subject !== subject){
        const newSubject = await getFirstPictogram(sentence["language"], {subject})
        sentence["sentence"][0] = newSubject
    }
    
    if(sentence["sentence"][1].verb !== verb){
        const newVerb = await getFirstPictogram(sentence["language"], {verb})
        sentence["sentence"][1] = newVerb
    }
    
    if(sentence["sentence"][2].object !== object){
        const newObject = await getFirstPictogram(sentence["language"], {object})
        sentence["sentence"][2] = newObject
    }
    return sentence
}


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