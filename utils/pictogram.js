const CustomError = require('../errors');
const Pictogram = require('../models/Pictogram');
const {searchByMeaningAndLang,searchById} = require('../adapters/imageAdapter');
const {getSoundFromPolly} = require('../adapters/soundAdapter');
const {uploadStream} = require('../adapters/cloudAdapter')

// This function takes as input the following arguments:
// 1) language (ex: "en"), forwarded by the Sentence controller (createSentence()) as part of the request
// 2) string (ex: "subject"="I"), forwarded by the Sentence controller (createSentence()) as part of the request
// and returns the whole Pictogram object,
// following the moongose Pictogram schema
const getFirstPictogram = async (language,string) => {
    // extract sentencePart, such as "subject" from "subject"="I"
    const sentencePart = Object.keys(string)[0]
    // extract meaning, such as "I" from "subject"="I"
    const meaning = string[sentencePart]
    // check if language is available
    const availableLanguages = [ 'en', 'it', 'fr']
    if (!availableLanguages.includes(language)) {
        throw new CustomError.NotFoundError(`No language associated with string ${language}`)
    }
    // get a list of best pictograms from the Image Adapter
    // by providing the necessary parameters

    

    const data = await searchByMeaningAndLang(language,meaning)
    if(!data.length){
        throw new CustomError.NotFoundError(`No pictogram associated with string ${meaning}`)
    }
    // take first pictogram from the list of best pictograms
    const firstPictogram = data[0]
    // extract ARASAAC picrogram ID
    pictogramId = firstPictogram["_id"]
    // take the meaning that ARASAAC uses for this pictogram (for consistency/reuse)
    const pictogramMeaning = firstPictogram.keywords[0].keyword
    
    // check if the ARASAAC pictogram ID already exists in the Pictogram collection of the database
    const pictogramIdAlreadyExists = await Pictogram.findOne({ arasaacId: pictogramId})
    
    // if the ARASAAC pictogram ID is not found in the collection, 
    // then it is a brand new pictogram
    // and needs to be added from scratch
    if (!pictogramIdAlreadyExists){    
        const pictogramObject = await addBrandNewPictogram(language, sentencePart,pictogramMeaning, pictogramId)
        return pictogramObject;
    } 

    // check if the ARASAAC pictogram ID already exists in the Pictogram collection of the database
    // and has the same language and/or sentencePart fields
    const pictogramAlreadyExists = await Pictogram.findOne({ arasaacId: pictogramId, language:language, sentencePart:sentencePart})
    
    // if the ARASAAC pictogram ID is found in the collection,
    // then we need to see if language xor sentencePart is the same
    if (!pictogramAlreadyExists){
        // if the ARASAAC pictogram ID is found and the sentencePart is the same
        // then we need to see if language is the same
        const langAlreadyExists = await Pictogram.findOne({ arasaacId: pictogramId, language:language})
        if (!langAlreadyExists){
            const pictogramObject = await addNewPictogramLang(language, sentencePart, pictogramMeaning,pictogramId)
            return pictogramObject;
        }
        // if the ARASAAC pictogram ID is found and the language is the same
        // then we need to see if sentencePart is the same
        const partAlreadyExists = await Pictogram.findOne({ arasaacId: pictogramId, sentencePart:sentencePart})
        if (!partAlreadyExists){
            const pictogramObject = await addNewPictogramPart(language, sentencePart, pictogramMeaning,pictogramId)
            return pictogramObject;
        }
    } else {
        // if the ARASAAC pictogram ID is found in the collection and 
        // it is exactly the same as the requested one
        // we do not want to waste memory to create a duplicate
        // so we return the one already present in the Pictogram collection
        const pictogramObject =  pictogramAlreadyExists
        return pictogramObject;
    }
}

// This function takes as input the following arguments:
// 1) whole sentence, forwarded by the Sentence controller (updateSentence())
// This sentence is proposed as an update by the user
// 2) sentencePart, forwarded by the Sentence controller (updateSentence())
// The sentencePart identifies the single pictogram role (either "subject", "verb", "object")
// 3) word, forwarded by the Sentence controller (updateSentence())
// The word is the meaning associated with each sentencePart (either "je", "manger", "courgette" ) 

// In this way, the function checks if the pictogram meaning associated with the specified sentencePart
// is different from the one in the original sentence
// If no difference is found, the function returns a null item for that sentencePart
// If a difference is found, 
// then the original pictogram meaning corresponding to that sentencePart
// is replaced with the new one, 
// along with all the other pictogram fields, through getFirstPictogram()
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

// This function takes as input the following arguments:
// 1) language, forwarded by outer getFirstPictogram()
// 2) sentencePart, forwarded by outer getFirstPictogram()
// 3)  pictogramMeaning, forwarded by outer getFirstPictogram()
// 4) pictogramId, forwarded by outer getFirstPictogram()
// adds a new Pictogram object to the Pictogram collection of the database,
// following mongoose Pictogram schema
// and returns the newly created Pictogram object
const addBrandNewPictogram = async (language, sentencePart, pictogramMeaning, pictogramId) => {  
    //get the pictogram image url from the Image Adapter
    const imageData = await searchById(pictogramId)
    if(!Object.keys(imageData)){
        throw new CustomError.NotFoundError(`No pictogram associated with ID ${pictogramId}`)
    }
    // extract image url
    const pictogramImageUrl = imageData["image"]
    // get the pictogram sound url from getAndStoreSound()
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

// This function takes as input the following arguments:
// 1) language, forwarded by outer getFirstPictogram()
// 2) sentencePart, forwarded by outer getFirstPictogram()
// 3) pictogramMeaning, forwarded by outer getFirstPictogram()
// 4) pictogramId, forwarded by outer getFirstPictogram()
// adds a new Pictogram object to the Pictogram collection of the database,
// reusing the image url of another Pictogram with the same ARASAAC ID,
// but not the sound, since language is changed,
// following mongoose Pictogram schema
// and returns the newly created Pictogram object 
const addNewPictogramLang = async (language, sentencePart, pictogramMeaning, pictogramId) => {  
    const duplicateImageUrl = await Pictogram.findOne({arasaacId: pictogramId}, 'imageUrl -_id')
    const pictogramSoundUrl = await getAndStoreSound(pictogramMeaning,language,pictogramId)
    const pictogramObject = await Pictogram.create(
    {
        arasaacId: pictogramId,
        sentencePart:sentencePart,
        meaning: pictogramMeaning,
        language: language,
        imageUrl: duplicateImageUrl["imageUrl"],
        soundUrl: pictogramSoundUrl
    })
    return pictogramObject;
}

// This function takes as input the following arguments:
// 1) language, forwarded by outer getFirstPictogram()
// 2) sentencePart, forwarded by outer getFirstPictogram()
// 3) pictogramMeaning, forwarded by outer getFirstPictogram()
// 4) pictogramId, forwarded by outer getFirstPictogram()
// adds a new Pictogram object to the Pictogram collection of the database,
// reusing the image and sound url of another Pictogram with the same ARASAAC ID,
// since the sentencePart is changed,
// following mongoose Pictogram schema
// and returns the newly created Pictogram object 
const addNewPictogramPart = async (language, sentencePart, pictogramMeaning,pictogramId) =>{
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
    return pictogramObject;
}

// This function takes as input the following arguments:
// 1) pictogramMeaning, forwarded by either addBrandNewPictogram() or addNewPictogramLang()
// 2) language, forwarded by either addBrandNewPictogram() or addNewPictogramLang()
// 3) pictogramId, forwarded by either addBrandNewPictogram() or addNewPictogramLang()
// and returns the mp3 file url of the sound associated with the input pictogram
const getAndStoreSound = async(pictogramMeaning,language,pictogramId) =>{
     //get the sound as an mp3 file from the Sound Adapter
    
    
    
    const soundData = await getSoundFromPolly(pictogramMeaning,language);
    if(!Object.keys(soundData)){
        throw new CustomError.NotFoundError(`No audio associated with ID ${pictogramId}`)
    }

    const getCloudObjectFromAdapter = `${process.env.JWT_SECRET}` +
     '/api/v1/cloud-adapter?' +
     'buffer=' + soundData.AudioStream;

    request(getCloudObjectFromAdapter, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body);
    });

    // get the uploaded mp3 file object from the Cloud Adapter
    const soundCloud = await uploadStream(soundData.AudioStream);
    if(!Object.keys(soundCloud)){
        throw new CustomError.NotFoundError(`No url associated with AudioStream ${soundData.AudioStream}`)
    }
    // extract the mp3 file url
    const pictogramSoundUrl = soundCloud["secure_url"];
    return pictogramSoundUrl;
}

module.exports = {
        getFirstPictogram,
        compareAndUpdatePictogram
};