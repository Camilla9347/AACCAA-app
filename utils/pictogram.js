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
    // take the meaning that ARASAAC uses for this pictogram (for consistency/reuse)
    const pictogramMeaning = firstPictogram.keywords[0].keyword
    //let pictogramObject = {};
    
    // check if the pictogram ID (from ARASAAC) already exists in the database
    const pictogramIdAlreadyExists = await Pictogram.findOne({ arasaacId: pictogramId})
    
    // if the pictogram ID (from ARASAAC) is not found in the database, 
    // then it is a brand new pictogram
    // and needs to be added from scratch
    if (!pictogramIdAlreadyExists){    
        const pictogramObject = await addNewPictogram(language, sentencePart,pictogramMeaning, pictogramId)
        return pictogramObject;
    } 

    // if the pictogram ID (from ARASAAC) is found, then we need to see if language 
    // and/or sentencePart is the same
    const pictogramAlreadyExists = await Pictogram.findOne({ arasaacId: pictogramId, language:language, sentencePart:sentencePart})
    
    if (!pictogramAlreadyExists){
        // if the pictogram ID (from ARASAAC) is found and the sentencePart is the same
        //then we need to see if language is the same
        const langAlreadyExists = await Pictogram.findOne({ arasaacId: pictogramId, language:language})
        if (!langAlreadyExists){
            const pictogramObject = await updateLangPictogram(language, sentencePart, pictogramMeaning,pictogramId)
            return pictogramObject;
        }
        // if the pictogram ID (from ARASAAC) is found and the language is the same
        //then we need to see if sentencePart is the same
        const partAlreadyExists = await Pictogram.findOne({ arasaacId: pictogramId, sentencePart:sentencePart})
        if (!partAlreadyExists){
            const pictogramObject = await updatePartPictogram(language, sentencePart, pictogramMeaning,pictogramId)
            return pictogramObject;
        }
            
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


const addNewPictogram = async (language, sentencePart, pictogramMeaning, pictogramId) =>{  
    
    // take the pictogram url from ARASAAC 
    const imageData = await searchById(pictogramId)
    if(!Object.keys(imageData)){
        throw new CustomError.NotFoundError(`No pictogram associated with ID ${pictogramId}`)
    }
    const pictogramImageUrl = imageData["image"]
    
    const pictogramSoundUrl = await getAndStoreSound(pictogramMeaning,language,pictogramId)
    
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

const updateLangPictogram = async (language, sentencePart, pictogramMeaning, pictogramId) => {  
        const duplicateImageUrl = await Pictogram.findOne({arasaacId: pictogramId}, 'imageUrl -_id')
        const pictogramSoundUrl = await getAndStoreSound(pictogramMeaning,language,pictogramId)

        pictogramObject = await Pictogram.create(
            {
                arasaacId: pictogramId,
                sentencePart:sentencePart,
                meaning: pictogramMeaning,
                language: language,
                imageUrl: duplicateImageUrl["imageUrl"],
                soundUrl: pictogramSoundUrl
            })

}


const updatePartPictogram = async (language, sentencePart, pictogramMeaning,pictogramId) =>{
    const duplicateImageUrl = await Pictogram.findOne({arasaacId: pictogramId}, 'imageUrl -_id')
    const duplicateSoundurl = await Pictogram.findOne({arasaacId: pictogramId}, 'soundUrl -_id')
    const pictogramObject = await Pictogram.create(
        {
            arasaacId: pictogramId,
            sentencePart:sentencePart,
            meaning: pictogramMeaning,
            language: language,
            imageUrl: duplicateImageUrl["imageUrl"],
            soundUrl: duplicateSoundurl["soundUrl"]
        })
    return pictogramObject
}
 
const getAndStoreSound = async(pictogramMeaning,language,pictogramId) =>{
    // take the sound as a stream of audio from Amazon Polly % API call
    const soundData = await getSoundFromPolly(pictogramMeaning,language);
    if(!Object.keys(soundData)){
        throw new CustomError.NotFoundError(`No audio associated with ID ${pictogramId}`)
    }
    // upload it to the cloud % API call
    const soundCloud = await uploadStream(soundData.AudioStream);
    if(!Object.keys(soundCloud)){
        throw new CustomError.NotFoundError(`No url associated with AudioStream ${soundData.AudioStream}`)
    }
    // and get the sound url from Cloudinary % API call
    const pictogramSoundUrl = soundCloud["secure_url"];
    return pictogramSoundUrl;
}



module.exports = {
        getFirstPictogram,
        compareAndUpdatePictogram
};