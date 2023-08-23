const { compareAndUpdatePictogram } = require('./pictogram');

// This function takes as input the following argument:

// 1) the original sentence, forwarded by the Sentence controller (updateSentence())
// 2) the "updated" subject (generally speaking, pictogram), forwarded by the Sentence controller (updateSentence())
// 3) the "updated" verb, forwarded by the Sentence controller (updateSentence())
// 4) the "updated" object, forwarded by the Sentence controller (updateSentence())

// checks which (if any) of the "updated" pictograms (either subject, verb or object),
// proposed by the specific user when they submit the whole "updated" sentence, 
// are actually different, by calling compareAndUpdatePictogram() on each "updated pictogram"

// and returns the "updated" sentence
const compareAndUpdateSentence = async (sentence, subject, verb, object) => {
    
    const newSubject = await compareAndUpdatePictogram(sentence, "subject", subject)
    const newVerb = await compareAndUpdatePictogram(sentence, "verb", verb)
    const newObject= await compareAndUpdatePictogram(sentence, "object", object)
    
    // if newSubject is not null, it means that the subject sentencePart has been updated
    if (!(Object.keys(newSubject).length ===0)){
        foundIndex = sentence.structure.findIndex(item => item.sentencePart === "subject");
        // update the subject sentencePart with the new one
        sentence.structure[foundIndex] = newSubject

    }
    // if newVerb is not null, it means that the verb sentencePart has been updated
    if (!(Object.keys(newVerb).length ===0)){
        foundIndex = sentence.structure.findIndex(item => item.sentencePart === "verb");
        // update the verb sentencePart with the new one
        sentence.structure[foundIndex] = newVerb

    }
    // if newObject is not null, it means that the object sentencePart has been updated
    if (!(Object.keys(newObject).length ===0)){
        foundIndex = sentence.structure.findIndex(item => item.sentencePart === "object");
        // update the object sentencePart with the new one
        sentence.structure[foundIndex] = newObject
    }
    return sentence;
}

module.exports = {
    compareAndUpdateSentence
}