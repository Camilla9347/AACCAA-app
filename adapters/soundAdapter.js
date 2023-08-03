

const AWS = require('aws-sdk')
const fs = require('fs')
require('dotenv').config()

AWS.config.credentials = new AWS.Credentials(
    process.env.AWS_ACCESS_KEY, // Your access key ID
    process.env.AWS_SECRET_KEY, // Your secret access key
  );
  
  // Define your service region.
AWS.config.region = "eu-north-1"; // Can also be saved in ENV vars.

const Polly = new AWS.Polly({
    region: AWS.config.region
})

const input = {
    Text: "Vaffanculo",
    LanguageCode: "it-IT",
    OutputFormat: "mp3",
    VoiceId: "Carla"
}

Polly.synthesizeSpeech(input, (err,data) => {
    if (err){
        console.log(err)
        return
    }
    if (data.AudioStream instanceof Buffer){
        fs.writeFile('hello.mp3', data.AudioStream, (fsErr)=> {
            if (fsErr){
                console.error(fsErr)
                return
            }
            console.log('Success')
        })
    }
})

