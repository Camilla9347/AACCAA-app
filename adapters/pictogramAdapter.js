const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const Pictogram = require('../models/Pictogram');

const getFirstPictogram = async (language,string) => {
    
    const sentencePart = Object.keys(string)[0]
    const meaning = string[sentencePart]
    const availableLanguages = [ 'en', 'it']
    
    if (!availableLanguages.includes(language)) {
        throw new CustomError.NotFoundError(`No language associated with string ${language}`)
    }

    const searchUrl = `https://api.arasaac.org/v1/pictograms/${language}/bestsearch/${meaning}`
    
    const searchResp = await fetch(searchUrl)
    const data = await searchResp.json()
    
    if(!data.length){
        throw new CustomError.NotFoundError(`No pictogram associated with string ${meaning}`)
    }
    
   
    const firstPictogram = data[0]
    
    pictogramObject = await createPictogramObject(firstPictogram, sentencePart)
    return pictogramObject
    
}

// to be moved in utils
const getPictogramById = async (pictogramId) => {
    
    const urlId = `https://api.arasaac.org/v1/pictograms/${Number(pictogramId)}?url=true`
    
    const imageResp = await fetch(urlId)
    const imageData = await imageResp.json()
    
    if(!Object.keys(imageData)){
        throw new CustomError.NotFoundError(`No pictogram associated with ID ${pictogramId}`)
    }
    return imageData
}

// to be moved in utils
const createPictogramObject = async (firstPictogram, sentencePart) => {
    
    pictogramId = firstPictogram["_id"]
    pictogramMeaning = firstPictogram.keywords[0].keyword
    pictogramImage = await getPictogramById(pictogramId)
    pictogramImageUrl = pictogramImage["image"]


    const pictogramObject = await Pictogram.findOneAndUpdate(
        { arasaacId:pictogramId },
        { $setOnInsert: { 
            sentencePart:sentencePart,
            meaning: pictogramMeaning,
            imageUrl: pictogramImageUrl 
        }}, 
        { upsert: true, returnOriginal: false }
    )
    return pictogramObject
}

module.exports = {
        getFirstPictogram
};