const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const Pictogram = require('../models/Pictogram');


// to be split into separate functions
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
    
    pictogramId = firstPictogram["_id"]
    
    const pictogramIdAlreadyExists = await Pictogram.findOne({ arasaacId: pictogramId})
    const pictogramMeaning = firstPictogram.keywords[0].keyword

    if (!pictogramIdAlreadyExists){
        // if arasaac id is not found, it is a new pictogram
        
        const urlId = `https://api.arasaac.org/v1/pictograms/${Number(pictogramId)}?url=true`
        const imageResp = await fetch(urlId)
        const imageData = await imageResp.json()
    
        if(!Object.keys(imageData)){
            throw new CustomError.NotFoundError(`No pictogram associated with ID ${pictogramId}`)
        }

        const pictogramImageUrl = imageData["image"]
        
        pictogramObject = await Pictogram.create(
            {
                arasaacId: pictogramId,
                sentencePart:sentencePart,
                meaning: pictogramMeaning,
                language: language,
                imageUrl: pictogramImageUrl
            })
    } 

    const pictogramAlreadyExists = await Pictogram.findOne({ arasaacId: pictogramId, language:language})
    
    if (!pictogramAlreadyExists){
            const duplicateImageUrl = await Pictogram.findOne({arasaacId: pictogramId}, 'imageUrl -_id')
            pictogramObject = await Pictogram.create(
                {
                    arasaacId: pictogramId,
                    sentencePart:sentencePart,
                    meaning: pictogramMeaning,
                    language: language,
                    imageUrl: duplicateImageUrl["imageUrl"]
                })
    } 
    pictogramObject = pictogramAlreadyExists
    return pictogramObject
}

module.exports = {
        getFirstPictogram
};