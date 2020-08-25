const util = require("util");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

const storage = new GridFsStorage({
  url: `mongodb+srv://runandJUMP:${process.env.PASSWORD}@depoppler-xznul.mongodb.net/dePoppler?retryWrites=true&w=majority`,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-dePoppler-${file.originalname}`;
      return filename;
    }
    
    return {
      bucketName: "photos",
      filename: `${Date.now()}-dePoppler-${file.originalname}`
    };
  }
});

const uploadFile = multer({ storage: storage }).single("file");
const uploadFilesMiddleware = util.promisify(uploadFile);
module.exports = uploadFilesMiddleware;