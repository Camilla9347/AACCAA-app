const cloudinary = require('cloudinary').v2
const { Readable } = require("stream");

const getCloudObject = async (req,res) => {
  const {buffer} = req.body
  result = await uploadStream(buffer)
  res.status(StatusCodes.OK).json({result})
}


// This function takes as input the following argument:
// 1) (audio) buffer, forwarded by the Pictogram util (getAndStoreSound() function)
// uploads the file as mp3 to the provided folder of the Cloudinary Media Library
// and returns as a Promise the uploaded file object, containing the associated url
async function uploadStream(buffer) {
    return new Promise((res, rej) => {
      const theTransformStream = cloudinary.uploader.upload_stream(
        {  
            use_filename:true,
            folder: "Polly-SDE",
            // automatically detects the file type (mp3)
            resource_type: "auto"
        },
        (err, result) => {
          if (err) return rej(err);
          res(result);
        }
      );
      let str = Readable.from(buffer);
      str.pipe(theTransformStream);
    });
  }

module.exports ={
    uploadStream,
    getCloudObject
}