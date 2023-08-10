const cloudinary = require('cloudinary').v2
const { Readable } = require("stream");

async function uploadStream(buffer) {
    return new Promise((res, rej) => {
      const theTransformStream = cloudinary.uploader.upload_stream(
        {  
            use_filename:true,
            folder: "Polly-SDE",
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
    uploadStream
}