const AWS = require('aws-sdk')


const getSound = async (req,res) => {
    const {user: {userId}, params: {id: sentenceId}} = req
}


// This function takes as input the following arguments:
// 1) the pictogram meaning, such us "I", or "eat" or "bread", forwarded by the Pictogram util (getAndStoreSound())
// 2) the language in which the meaning was type by the user,  forwarded by the Pictogram util (getAndStoreSound())

// and returns the synthesized speech corresponding to the pictogram meaning in mp3 audio format
const getSoundFromPolly = async(pictogramMeaning,language) => {
    const Polly = new AWS.Polly({
        region: AWS.config.region
    })

    // const rndInt = Math.floor(Math.random() * 2) + 1
    // the language voice is set by default to female, 
    // but it can be switched to male from here, by setting rndInt to 1
    // before, the language voice for each pictogram was chosen randomly, favouring gender fluidity
    // however, kids in the autism spectrum have a better understanding of speech
    // if it comes from the same person, with the same tone of voice

    const rndInt= 2;

    let voice = ""
    let code = ""

    if (language === "en") {
        if (rndInt == 2){
            voice = "Joanna"
        } else {
            voice = "Joey"
        }
        code = "en-US"
    }

    if  (language === "it") {
        if (rndInt == 2){
            voice = "Carla"
        } else {
            voice = "Giorgio"
        }

        code = "it-IT"
    }

    if  (language === "fr") {
        if (rndInt == 2){
            voice = "Celine"
        } else {
            voice = "Mathieu"
        }

        code = "fr-FR"
    }
    

    const input = {
        Text: pictogramMeaning,
        LanguageCode: code,
        OutputFormat: "mp3",
        VoiceId: voice
    }

    // check the correctness of the file output format
    return Polly.synthesizeSpeech(input).promise().then( audio => {
        if (audio.AudioStream instanceof Buffer) return audio
        else throw 'AudioStream is not a Buffer.'
    })
}



module.exports = {
    getSoundFromPolly,
    getSound
}