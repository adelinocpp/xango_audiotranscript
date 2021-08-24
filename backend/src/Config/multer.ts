import multer from "multer";
import path from "path";
import crypto  from "crypto";
require("dotenv").config();

export default module.exports = 
{
    dest: path.resolve(__dirname, "..", "..","tmp"),
    storage: multer.diskStorage(
    {
        destination: (req, file, cb) => {
            // console.log("destination");
            cb(null, path.resolve(__dirname, "..", "..","tmp"));
        },
        filename: (req, file, cb) => {
            // console.log("filename");
            crypto.randomBytes(16, (err,hash) => {
                file.filename = `${hash.toString("hex")}-${file.originalname}`;
                if(err)
                    cb(err, file.filename);
                cb(null,file.filename);
            })
        }
    })
};