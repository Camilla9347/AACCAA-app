const CustomError = require('../errors');
const Pictogram = require('../models/Pictogram');
const {searchByMeaningAndLang,searchById} = require('../adapters/imageAdapter');
const {getSoundFromPolly} = require('../adapters/soundAdapter');
const {uploadStream} = require('../adapters/cloudAdapter')


const getFirstPictogram = async (language,string) => {
    // extract sentencePart from user input, such as "subject" from "subject"="I"
    const sentencePart = Object.keys(string)[0]
    // extract meaning from user input, such as "I" from "subject"="I"
    const meaning = string[sentencePart]
    // check if language provided by user is available
    const availableLanguages = [ 'en', 'it']
    if (!availableLanguages.includes(language)) {
        throw new CustomError.NotFoundError(`No language associated with string ${language}`)
    }
    // search best pictograms from ARASAAC GET API call
    const data = await searchByMeaningAndLang(language,meaning)
    if(!data.length){
        throw new CustomError.NotFoundError(`No pictogram associated with string ${meaning}`)
    }
    // take first pictogram from the list of best pictograms provided by ARASAAC GET API call
    const firstPictogram = data[0]
    pictogramId = firstPictogram["_id"]

    //let pictogramObject = {};
    
    // check if the pictogram ID (from ARASAAC) already exists in the database
    const pictogramIdAlreadyExists = await Pictogram.findOne({ arasaacId: pictogramId})
    
    // if the pictogram ID (from ARASAAC) is not found in the database, 
    // then it is a brand new pictogram
    // and needs to be added from scratch
    if (!pictogramIdAlreadyExists){    
        const pictogramObject = addNewPictogram(firstPictogram, pictogramid)
        return pictogramObject;
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


const addNewPictogram = async (firstPictogram, pictogramId) =>{  
    // take the meaning that ARASAAC uses for this pictogram (for consistency/reuse)
    const pictogramMeaning = firstPictogram.keywords[0].keyword
    // take the pictogram url from ARASAAC 
    const imageData = await searchById(pictogramId)
    if(!Object.keys(imageData)){
        throw new CustomError.NotFoundError(`No pictogram associated with ID ${pictogramId}`)
    }
    const pictogramImageUrl = imageData["image"]
    
    // take the sound as a stream of audio from Amazon Polly % API call
    const soundData = await getSoundFromPolly(pictogramMeaning,language);
    if(!Object.keys(soundData)){
        throw new CustomError.NotFoundError(`No audio associated with ID ${pictogramId}`)
    }
    // upload it to the cloud
    const soundCloud = await uploadStream(soundData.AudioStream);
    if(!Object.keys(soundCloud)){
        throw new CustomError.NotFoundError(`No url associated with AudioStream ${soundData.AudioStream}`)
    }
    // and get the sound url from Cloudinary % API call
    const pictogramSoundUrl = soundCloud["secure_url"];

    // create the Pictogram Object in the database
    const pictogramObject = await Pictogram.create(
        {
            arasaacId: pictogramId,
            sentencePart:sentencePart,
            meaning: pictogramMeaning,
            language: language,
            imageUrl: pictogramImageUrl,
            soundUrl: pictogramSoundUrl
        })
    return pictogramObject;
}

module.exports = {
        getFirstPictogram,
        compareAndUpdatePictogram
};