const Sentence = require('../models/Sentence');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const {getFirstPictogram, compareAndUpdateSentence} = require('../utils')

const getAllSentences = async (req,res) => {
    const sentences = await Sentence.find({createdBy:req.user.userId}).sort('createdAt')
    res.status(StatusCodes.OK).json({sentences, count: sentences.length})
    

}

const getSingleSentence = async (req,res) => {
    const {user: {userId}, params: {id: sentenceId}} = req
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
    // get all the post request parameters from the request body
    const {language, subject, verb, object} = req.body
    if (!language || !subject || !verb || !object){
        throw new CustomError.BadRequestError('Please provide language, subject, verb and object')
    }
    
    // create each single pictogram, based on its sentencePart (subject, verb, object)
    const subjectPictogram = await getFirstPictogram(language,{subject})
    const verbPictogram = await getFirstPictogram(language,{verb})
    const objectPictogram = await getFirstPictogram(language,{object})
    
    // chain the pictograms in a sentence (subject - verb - object)
    sentenceArray = new Array(subjectPictogram,verbPictogram,objectPictogram)
    
    // attach the user ID of the user that created the sentence to the request body
    req.body.createdBy = req.user.userId
    // attach the actual sentence as structure field of the Sentence schema to the request body
    req.body.structure =  sentenceArray
    
    // avoid creation of duplicate sentences
    const sentenceAlreadyExists = await Sentence.findOne({ structure: sentenceArray, createdBy:req.user.userId})
    if(!sentenceAlreadyExists){
        // create/add the sentence to the Sentence collection of the database
        // following the moongose Sentence schema (directly from req.body)
        const sentence = await Sentence.create(req.body);
        res.status(StatusCodes.CREATED).json({sentence})
    } else {
        res.status(StatusCodes.CONFLICT).send('Duplicated sentence, please create a different one')
    }
}


const updateSentence = async (req,res) => {
    // get single pictograms, 
    // the sentence DB ID,
    // and the user ID associated with that sentence
    const {
        body:{subject,verb,object},
        user: {userId}, 
        params: {id: sentenceId}
    } = req

    if (!subject || !verb || !object){
        throw new CustomError.BadRequestError('Please provide language, subject, verb and object')
    }
    
    // check that single pictograms are present
    if (subject==='' || verb==='' || object===''){
        throw new CustomError.BadRequestError('subject, verb, or object fields cannot be empty')

    }

    // look for the sentence ID (and associated user ID) in the Sentence collection of the database
    const sentence = await Sentence.findOne({
        _id:sentenceId,
        createdBy: userId
    });

    // check that the sentence actually exists
    if(!sentence){
        throw new CustomError.NotFoundError(`No sentence with id: ${sentenceId}`)
    }
    
    // check  which part (if any, if all) of the sentence has been updated
    const updatedSentence = await compareAndUpdateSentence(sentence, subject, verb, object);
    
    // updates only if updatedSentence is different from the original sentence
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


// delete the sentence but not the pictograms (for reuse)
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