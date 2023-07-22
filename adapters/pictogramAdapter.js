const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');

const getFirstPictogram = async (string) => {
    
    const searchUrl = `https://api.arasaac.org/v1/pictograms/it/bestsearch/${string}`
    const searchResp = await fetch(searchUrl)
    const data = await searchResp.json()
    
    if(!data.length){
        throw new CustomError.NotFoundError(`No pictogram associated with string ${string}`)
    }
    
    const firstPictogram = data[0]

    // input values of future getPictogrambyId
    pictogramId = firstPictogram["_id"]
    
    //pictogramMeaning = firstResp.keywords[0].keyword
    pictogramImage = await getPictogramById(pictogramId)
    
    
    return pictogramImage
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


    

    // https://api.arasaac.org/v1/pictograms/en/bestsearch/I
    // https://api.arasaac.org/v1/pictograms/2617
    // https://api.arasaac.org/v1/pictograms/en/bestsearch/eat
    // https://api.arasaac.org/v1/pictograms/2349
    // https://api.arasaac.org/v1/pictograms/en/bestsearch/hamburgers
    // https://api.arasaac.org/v1/pictograms/2419


module.exports = {
        getFirstPictogram
    };