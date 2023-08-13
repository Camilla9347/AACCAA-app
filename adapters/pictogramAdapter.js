const searchByMeaningAndLang = async (language,meaning) => {

    

    const searchUrl = `https://api.arasaac.org/v1/pictograms/${language}/bestsearch/${meaning}`
    
    const searchResp = await fetch(searchUrl)
    const data = await searchResp.json()
    
    return data

}

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
