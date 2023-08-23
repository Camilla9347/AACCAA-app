const mongoose = require('mongoose')
const Pictogram = require('./Pictogram');

const SentenceSchema = new mongoose.Schema({
    
    structure:{
        type:[Pictogram.schema],
        required:[true, 'please provide s-v-o sentence'],
    },
    language: {
        type: String,
        enum: {
          values: ['en', 'it', 'fr'],
          message: '{VALUE} is not supported',
        },
        required:[true, 'please provide sentence language'],
    },
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref: 'User',
        required:[true, 'Please provide user']
    }

},{timestamps:true});

module.exports = mongoose.model('Sentence', SentenceSchema)