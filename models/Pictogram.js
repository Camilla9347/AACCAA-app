const mongoose = require('mongoose')
const validator = require('validator')

const PictogramSchema = new mongoose.Schema({
    
    arasaacId:{
        type: Number,
        required:[true, 'Please provide arasaac Id'],
    },

    sentencePart:{
        type: String,
        required:[true, 'Please provide sentence part'],
        enum: {
            values: ['subject', 'verb', 'object'],
            message: '{VALUE} is not supported',
        },
    },

    meaning:{
        type: String,
        required:[true, 'Please provide associated meaning'],
    },

    language: {
        type: String,
        enum: {
          values: ['en', 'it'],
          message: '{VALUE} is not supported',
        },
        required:[true, 'Please provide pictogram language'],
    },

    imageUrl:{
        type:String,
        required:[true, 'Please provide image url'],
        
        validate: { 
            validator: validator.isURL,
            message: 'Please provide a valid url' 
        },
    },
});

module.exports = mongoose.model('Pictogram', PictogramSchema)