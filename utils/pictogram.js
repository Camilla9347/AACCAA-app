const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const Pictogram = require('../models/Pictogram');
const { searchByMeaningAndLang, searchById } = require('../adapters/imageAdapter');
const {getSoundFromPolly} = require('../adapters/soundAdapter');
const {uploadStream} = require('../adapters/cloudAdapter')


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

        const soundData = await getSoundFromPolly(pictogramMeaning,language);
        
        if(!Object.keys(soundData)){
            throw new CustomError.NotFoundError(`No audio associated with ID ${pictogramId}`)
        }

        const soundCloud = await uploadStream(soundData.AudioStream);
        
        if(!Object.keys(soundCloud)){
            throw new CustomError.NotFoundError(`No url associated with AudioStream ${soundData.AudioStream}`)
        }
        
        const pictogramSoundUrl = soundCloud["secure_url"];
        
        pictogramObject = await Pictogram.create(
            {
                arasaacId: pictogramId,
                sentencePart:sentencePart,
                meaning: pictogramMeaning,
                language: language,
                imageUrl: pictogramImageUrl,
                soundUrl: pictogramSoundUrl
            })
    } 

    const pictogramAlreadyExists = await Pictogram.findOne({ arasaacId: pictogramId, language:language})
    // se l'id del pittogramma c'è ma la lingua è cambiata, l'immagine non devo aggiornarla ma 
    // ma l'audio devo aggiornarlo!

    if (!pictogramAlreadyExists){
            const duplicateImageUrl = await Pictogram.findOne({arasaacId: pictogramId}, 'imageUrl -_id')
            const soundData = await getSoundFromPolly(pictogramMeaning,language);
        
            if(!Object.keys(soundData)){
                throw new CustomError.NotFoundError(`No audio associated with ID ${pictogramId}`)
            }

            const soundCloud = await uploadStream(soundData.AudioStream);
            
            if(!Object.keys(soundCloud)){
                throw new CustomError.NotFoundError(`No url associated with AudioStream ${soundData.AudioStream}`)
            }
            
            const pictogramSoundUrl = soundCloud["secure_url"];

            pictogramObject = await Pictogram.create(
                {
                    arasaacId: pictogramId,
                    sentencePart:sentencePart,
                    meaning: pictogramMeaning,
                    language: language,
                    imageUrl: duplicateImageUrl["imageUrl"],
                    soundUrl: pictogramSoundUrl
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