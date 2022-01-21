require("dotenv").config();
import crypto from "crypto";
import { prefix } from "../Models/User";

// ------------------------------------------------------------------------
function generatePrefixFrontEnd(numKeys:number = 10):prefix[]{
    var setNumbers:number[] = [13, 41, 53, 83]
    var codeNumbers:number[] = [];
    var rejectNumber:boolean = false, genNumber:number;
    let i = 0;
    while (i < numKeys){
        genNumber =  Math.trunc(10000*Math.random())
        rejectNumber = false;
        if (genNumber < 1000)
            rejectNumber = true;
        for (let j = 0; j < setNumbers.length; j++)
            if ((genNumber % setNumbers[j]) == 0)
                rejectNumber = true;
        if (rejectNumber)
            continue;
        else{
            codeNumbers = [...codeNumbers, genNumber];
            i++;
        }
    }
    let idxV =  Math.trunc(numKeys*Math.random())
    let idxN =  Math.trunc((setNumbers.length-1)*Math.random())
    codeNumbers[idxV] = Math.trunc(codeNumbers[idxV]/setNumbers[idxN])*setNumbers[idxN]
    var selPrefix:prefix[] = [];
    var tempPrefix:prefix;
    for (let j = 0; j < codeNumbers.length; j++){
        let encripString = '';
        if (idxV == j)
            encripString = codeNumbers[j].toString()
        else
            encripString = (codeNumbers[j] - Math.trunc(100*Math.random())).toString()
        tempPrefix = {
            key: codeNumbers[j].toString(),
            value: encriptString(<string>process.env.PW_PREFIX,encripString)
        }
        selPrefix = [...selPrefix,tempPrefix];
    }
    return selPrefix;
}
// ------------------------------------------------------------------------
function stringInvalid(testString:string|undefined): boolean{
    return ((testString === undefined) || (testString === null) || (testString === "NULL") || (testString === ""));
}
// ----------------------------------------------------------------------------
function encriptString(strInput: string|undefined, strId:string|undefined):string{
    if (stringInvalid(strInput))
        return "";
    var resizedIV = Buffer.alloc(16, 0),
    iv = crypto
        .createHash("sha256")
        .update(process.env.CRIPT_IV as string)
        .digest();
    iv.copy(resizedIV);
    var key = crypto
        .createHash("sha256")
        .update(process.env.DB_CRIPTO_PREFIX+ (strId as string))
        .digest();
    var cipher = crypto.createCipheriv("aes256", key, resizedIV);
    //console.log("strInput:",strInput);
    let encrypted = cipher.update(strInput as string, "binary", "hex");
    encrypted +=  cipher.final("hex");
    return encrypted.toString();
}
// ----------------------------------------------------------------------------
function dencriptString(strInput: string, strId:string):any{
    if (stringInvalid(strInput) || strInput.length < 32)
        return undefined;

    var resizedIV = Buffer.alloc(16, 0),
    iv = crypto
        .createHash("sha256")
        .update(process.env.CRIPT_IV as string)
        .digest();
    iv.copy(resizedIV);
    var key = crypto
        .createHash("sha256")
        .update(process.env.DB_CRIPTO_PREFIX+ (strId as string))
        .digest();
    var decipher = crypto.createDecipheriv("aes256", key, resizedIV);
    let decrypted = decipher.update(strInput, "hex", "binary");
    decrypted += decipher.final("binary");
    return decrypted.toString();
}
// ----------------------------------------------------------------------------
export {
    encriptString,
    dencriptString,
    stringInvalid,
    generatePrefixFrontEnd};