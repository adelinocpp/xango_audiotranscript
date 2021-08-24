require("dotenv").config();
import crypto from "crypto";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { Pool } from "pg";
import {connectionStringWebUser} from "../Database/General";
import { NextFunction } from 'express';
import { DencriptString, stringInvalid } from "./CryptoString";

// ----------------------------------------------------------------------------
interface tokenInfoInterface {
    id: number
    iat?: string
    exp?: string
    validy?: boolean
}
// ----------------------------------------------------------------------------
interface tokenReturnInterface {
    accessToken: string
    exp: Date
}
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
    var gotPrefix:string = DencriptString(strInput,strKey);
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
    } catch(err) {
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
    } catch(e) {
        console.log("ERROR em CheckToken() (database access) em Authentication: ", e.stack.split("at")[0]);
        throw e;
    } finally {
        // console.log("tokenInfo: ", tokenInfo)
        return tokenInfo;
    }
}
// ----------------------------------------------------------------------------

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
export {tokenInfoInterface, 
        tokenReturnInterface,
        EncriptPassWord,
        DencriptPassWord,
        CheckToken,
        CheckEmail,
        FitData,
        GenerateToken
        };