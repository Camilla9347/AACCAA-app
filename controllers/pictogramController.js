const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');


const getPictogram = async (req,res) => {
    
    const {string} = req.params
    
    const url = `https://api.arasaac.org/v1/pictograms/en/bestsearch/${string}`
    
    const resp = await fetch(url)
    const data = await resp.json()
    
    if(!data.length){
        throw new CustomError.NotFoundError(`No pictogram associated with string ${string}`)
    }
    
    const firstResp = data[0]

    // input values of future getPictogrambyId
    pictogramId = firstResp["_id"]
    console.log(pictogramId)
    console.log(firstResp.keywords[0].keyword)

    
    res.status(StatusCodes.OK).json(firstResp)    
}

    // https://api.arasaac.org/v1/pictograms/en/bestsearch/I
    // https://api.arasaac.org/v1/pictograms/2617
    // https://api.arasaac.org/v1/pictograms/en/bestsearch/eat
    // https://api.arasaac.org/v1/pictograms/2349
    // https://api.arasaac.org/v1/pictograms/en/bestsearch/hamburger
    // https://api.arasaac.org/v1/pictograms/2419


module.exports = {
        getPictogram
    };