const mongoose = require('mongoose')
const Pictogram = require('./Pictogram');

const SentenceSchema = new mongoose.Schema({
    
    structure:{
        type:[Pictogram.schema],
        minLength: 3, // not sure about this
        required:[true, 'please provide a minimal (s-v-o) sentence structure'],
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

module.exports = mongoose.model('Sentence', SentenceSchema)