const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const AWS = require('aws-sdk')
const cloudinary = require('cloudinary').v2

const storeSoundInCloud = async(sound) => {
    const result = await cloudinary.uploader.upload_stream({
        use_filename:true,
        folder: "Polly-SDE",
        resource_type: "auto"
    }).end(sound);
    console.log(result.url)
    
}

const getSoundFromPolly = async (pictogramMeaning,language) => {

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

    console.log(input)

    
    Polly.synthesizeSpeech(input, (err,data) => {
        if (err){
            console.log(err)
            return
        }
        if (data.AudioStream instanceof Buffer){
            const result = storeSoundInCloud(data.AudioStream)
            // url del suono
            //console.log(result)
        }
    })
    
    
}

module.exports = {
    getSoundFromPolly,
    storeSoundInCloud 
}