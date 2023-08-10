const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const AWS = require('aws-sdk')


const getSoundFromPolly = async(pictogramMeaning,language) => {
    const Polly = new AWS.Polly({
        region: AWS.config.region
    })

    const rndInt = Math.floor(Math.random() * 2) + 1

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
    // per ora supportiamo solo italiano e inglese
    const input = {
        Text: pictogramMeaning,
        LanguageCode: code,
        OutputFormat: "mp3",
        VoiceId: voice
    }

    //console.log(input)

    return Polly.synthesizeSpeech(input).promise().then( audio => {
        if (audio.AudioStream instanceof Buffer) return audio
        else throw 'AudioStream is not a Buffer.'
    })
}



module.exports = {
    getSoundFromPolly,
}