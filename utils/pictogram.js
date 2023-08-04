const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const Pictogram = require('../models/Pictogram');
const { searchByMeaningAndLang, searchById } = require('../adapters/imageAdapter');
const {getSoundFromPolly} = require('../adapters/soundAdapter');


// to be split into separate functions
const getFirstPictogram = async (language,string) => {
    const sentencePart = Object.keys(string)[0]
    const meaning = string[sentencePart]
    const availableLanguages = [ 'en', 'it']
    
    if (!availableLanguages.includes(language)) {
        throw new CustomError.NotFoundError(`No language associated with string ${language}`)
    }

   
    const data = await searchByMeaningAndLang(language,meaning)
    
    
    if(!data.length){
        throw new CustomError.NotFoundError(`No pictogram associated with string ${meaning}`)
    }
    const firstPictogram = data[0]
    
    pictogramId = firstPictogram["_id"]
    
    const pictogramIdAlreadyExists = await Pictogram.findOne({ arasaacId: pictogramId})
    const pictogramMeaning = firstPictogram.keywords[0].keyword
    let pictogramObject = {};

    if (!pictogramIdAlreadyExists){
        // if arasaac id is not found, it is a new pictogram
        const imageData = await searchById(pictogramId)
    
        if(!Object.keys(imageData)){
            throw new CustomError.NotFoundError(`No pictogram associated with ID ${pictogramId}`)
        }

        const pictogramImageUrl = imageData["image"]

        const soundData = await getSoundFromPolly(pictogramMeaning,language)

        //const pictogramSoundUrl =
        
        pictogramObject = await Pictogram.create(
            {
                arasaacId: pictogramId,
                sentencePart:sentencePart,
                meaning: pictogramMeaning,
                language: language,
                imageUrl: pictogramImageUrl
                //soundUrl: pictoramSoundUrl
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
                    //soundUrl: pictogramSoundUrl
                })
    } else {
        pictogramObject =  pictogramAlreadyExists
    }
    
    return pictogramObject
}


const compareAndUpdatePictogram = async (sentence,sentencePart,word) => {

    // make object compliant with getFirstPictogram syntax
    const propertyName = sentencePart;
    const string = {};
    string[propertyName] = word;

    let newItem = {}
    
    const found = sentence.structure.find(item => item.sentencePart === sentencePart && item.meaning === word);
    
    if (!found){
        newItem = await getFirstPictogram(sentence.language, string)
    }
    return newItem

}


module.exports = {
        getFirstPictogram,
        compareAndUpdatePictogram
};