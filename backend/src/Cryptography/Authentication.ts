require("dotenv").config();
import crypto from "crypto";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { Pool } from "pg";
import {connectionStringWebUser} from "../Database/General";
import { NextFunction } from 'express';
import { dencriptString, stringInvalid } from "./CryptoString";
import child from "child_process";
import util from "util";
import fs from "fs";
import { tokenInfoInterface } from "../Models/User";

// ----------------------------------------------------------------------------
function GenerateToken(id:string, time:number = (<number>(process.env.TOKEN_VALIDITY == undefined? 24: <unknown>process.env.TOKEN_VALIDITY))*60*60):string{ // padrão 24 horas
    var secret: string;
    secret = <string>process.env.TOKEN_ACCESS;
    return (jwt.sign({ id }, secret, {expiresIn: time}));
}
// ----------------------------------------------------------------------------
function EncriptPassWord(strInput: string): string{
    const hash = crypto.createHash('sha256');
    hash.update((strInput + process.env.PW_SUFFIX), "utf8");
    return hash.digest('hex');
}
// ----------------------------------------------------------------------------
function DencriptPassWord(strInput: string, strKey:string): boolean{
    // console.log("strInput,strKey",strInput,strKey)
    var gotPrefix:string = dencriptString(strInput,strKey);
    // console.log("gotPrefix",gotPrefix)
    return ((process.env.PW_PREFIX as string) == gotPrefix);
}
// ----------------------------------------------------------------------------
async function CheckToken(token: string):Promise<tokenInfoInterface>
{
    var tokenInfo:tokenInfoInterface;
    tokenInfo = {id: -1, validy: false};
    var QS: string, CS: string, tokenSecret:string;
    CS = connectionStringWebUser;
    tokenSecret = <string>process.env.TOKEN_ACCESS;
    QS = 'SELECT * FROM access_keys WHERE id = $1 AND active_record = TRUE';
    try{
        tokenInfo = <tokenInfoInterface>jwt.verify(token, tokenSecret, {ignoreExpiration: true});
        tokenInfo.validy = false;
    } catch(err:any) {
        console.log("ERROR em CheckToken() (token verify) em Authentication: ", err.stack.split("at")[0].split("at")[0]);
        throw err;
    } finally {
        if (tokenInfo.id === -1)
            return tokenInfo;
    }
    
    try {
        const pool = new Pool({ connectionString: CS });
        let result = await pool.query(QS, [tokenInfo.id]);
        pool.end();
        if (result.rowCount == 1) {
            let date_now = new Date();
            let date_exp = new Date(Number(tokenInfo.exp) * 1000); // - date_now.getTimezoneOffset());
            tokenInfo.validy = (date_exp > date_now)
        }
    } catch(e:any) {
        console.log("ERROR em CheckToken() (database access) em Authentication: ", e.stack.split("at")[0]);
        throw e;
    } finally {
        // console.log("tokenInfo: ", tokenInfo)
        return tokenInfo;
    }
}
// ----------------------------------------------------------------------------
export const sleep = (milliseconds:number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
// ----------------------------------------------------------------------------  
async function getMediaInfoData(fullpath:string, destRemove:string=""):Promise<string>{
    var returnValue = "";
    try{
        if (fs.existsSync(fullpath)){
            var strConsoleCommand:string = "mediainfo " + fullpath + " --Output=JSON";
            const exec_command = util.promisify(child.exec);
            var { stdout } = await exec_command(strConsoleCommand);
            if (destRemove !== "")
                stdout = JSON.stringify(stdout).replace(destRemove,'');
            returnValue = stdout;
        }
    }catch(err:any){
        console.log("ERROR em getMediaInfoData() em Authentication: ", err.stack.split("at")[0]);
    } finally{
        return returnValue;
    }
}
// ----------------------------------------------------------------------------  
async function getMD5Hash(fullpath:string):Promise<string>{
    var returnValue = "";
    try{
        if (fs.existsSync(fullpath)){
            var strConsoleCommand:string = "md5sum " + fullpath + " | cut -c -32";
            const exec_command = util.promisify(child.exec);
            var {stdout} = await exec_command(strConsoleCommand);
            returnValue = stdout.replace(/\n/g, '');
        }
    }catch(err:any){
        console.log("ERROR em getMD5Hash() em Authentication: ", err.stack.split("at")[0]);
    } finally{
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
function CheckEmail(email: string):boolean{
    var result = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g.test(email);
    return result;
}
// ----------------------------------------------------------------------------
function FitData(data: string):string{
    var returnString: string = "";
    returnString = (data === undefined)? "": data;
    return returnString.replace(/\s/g, "");
}
// ----------------------------------------------------------------------------
function ExtractFileName(data: string):string{
    var returnString: string = "";
    if (data !== undefined){
        let fileParts = data.split('/');
        returnString = fileParts[fileParts.length-1];
    }
    return returnString
}
// ----------------------------------------------------------------------------
function ExtractFileExt(data: string):string{
    var returnString: string = "";
    if (data !== undefined){
        let fileParts = data.split('.');
        returnString = fileParts[fileParts.length-1];
    }
    return returnString
}
// ----------------------------------------------------------------------------
// function checkValidyTable(table_name:string):string{
//   switch (table_name) {
//     case "audio": return "audio_file";
//     case "transcript": return "transcript_file";
//     default: return "nothing";
//   } 
// }
// ----------------------------------------------------------------------------
export {EncriptPassWord,
        DencriptPassWord,
        CheckToken,
        CheckEmail,
        FitData,
        GenerateToken,
        getMediaInfoData,
        getMD5Hash,
        ExtractFileName,
        ExtractFileExt
        };
        