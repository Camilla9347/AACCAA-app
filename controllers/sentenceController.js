const getAllSentences = async (req,res) => {
    res.send('get all sentences')
}

const getSingleSentence = async (req,res) => {
    res.send('get single sentence')
}

// not sure about post CreateSentence, it may be a searchSentence so get with queryString
const createSentence = async (req,res) => {
    res.send('create sentence')
}

const updateSentence = async (req,res) => {
    res.send('update sentence')
}

const deleteSentence = async (req,res) => {
    res.send('delete sentence')
}

module.exports = {
    getAllSentences,
    getSingleSentence,
    createSentence,
    updateSentence,
    deleteSentence
};