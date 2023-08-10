const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const AWS = require('aws-sdk')
const cloudinary = require('cloudinary').v2
const fs = require('fs')
const { Readable } = require("stream");

const storeSoundInCloud = async(sound) => {
    
    /*
    const result = await cloudinary.uploader.upload_stream({
        use_filename:true,
        folder: "Polly-SDE",
        resource_type: "auto"
    });
    streamifier.createReadStream(sound).pipe(result);
    console.log(result)
    return result;
    */

    const theTransformStream = cloudinary.uploader.upload_stream(
        {  
            use_filename:true,
            folder: "Polly-SDE",
            resource_type: "auto"
        },
        (err, result) => {
          if (err) return console.error(err);
          console.log(result);
        }
      );
      let str = Readable.from(sound);
      str.pipe(theTransformStream);
      return str
    
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
            console.log(result)
            /*
            fs.writeFile("audioFile.mp3", data.AudioStream, (fsErr) => {
                if(fsErr){
                    console.error(err)
                    return
                }
                console.log("Success")
            })
            */
        }
    })
}

module.exports = {
    getSoundFromPolly,
    storeSoundInCloud 
}