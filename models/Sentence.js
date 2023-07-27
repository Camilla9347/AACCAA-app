const mongoose = require('mongoose')

const SentenceSchema = new mongoose.Schema({
    
    sentence: {
        type:Array
    },
    language: {
        type: String,
        enum: {
          values: ['en', 'it'],
          message: '{VALUE} is not supported',
        },
    },
    
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref: 'User',
        required:[true, 'Please provide user']
    }
},{timestamps:true});



//export mongoose model
module.exports = mongoose.model('Sentence', SentenceSchema)