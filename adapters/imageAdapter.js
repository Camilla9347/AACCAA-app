// This function takes as input the following arguments:
// 1) language, forwarded by the Pictogram util (getFirstPictogram() function), either "en" or "it"
// 2) meaning, forwarded by the Pictogram util (getFirstPictogram() function), such as "I", or "love", or "apple"
// and returns a list of best pictograms based on the provided meaning and language parameters (embedded in URL), 
// by fetching the response from ARASAAC GET API call
const searchByMeaningAndLang = async (language,meaning) => {
    const searchUrl = `https://api.arasaac.org/v1/pictograms/${language}/bestsearch/${meaning}`
    const searchResp = await fetch(searchUrl)
    const data = await searchResp.json()
    return data
}

// This function takes as input the following argument:
// 1) pictogramId, forwarded by the Pictogram util (getFirstPictogram() function), such as 2617
// and returns pictogram image url,
// by fetching the response from ARASAAC GET API call
const searchById = async (pictogramId) => {
    const urlId = `https://api.arasaac.org/v1/pictograms/${Number(pictogramId)}?url=true`
    const imageResp = await fetch(urlId)
    const imageData = await imageResp.json()
    return imageData
}


module.exports = {
    searchByMeaningAndLang,
    searchById
};
