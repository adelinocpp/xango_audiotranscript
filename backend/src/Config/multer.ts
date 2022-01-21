import multer from "multer";
import path from "path";
import crypto  from "crypto";
require("dotenv").config();

export default module.exports = 
{
    // process.env.AUDIO_FILES_FOLDER
    // dest: path.resolve(__dirname,"..", "..", "..","audio_files"),
    dest: path.resolve(__dirname,process.env.AUDIO_FILES_FOLDER as string),
    storage: multer.diskStorage(
    {
        destination: (req, file, cb) => {
            // console.log("destination");
            cb(null, path.resolve(__dirname, process.env.AUDIO_FILES_FOLDER as string));
        },
        filename: (req, file, cb) => {
            // console.log("filename");
            crypto.randomBytes(16, (err,hash) => {
                file.filename = `${hash.toString("hex")}-${file.originalname.replace(/[\(\)]/g, "").replace(/[/\\?&%*:;|"'<>-]/g, '_').replace(/ /g,"_")}`;
                if(err)
                    cb(err, file.filename);
                cb(null,file.filename);
            })
        }
    })
};
