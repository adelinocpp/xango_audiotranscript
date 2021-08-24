require("dotenv").config();
import {tokenInfoInterface, tokenReturnInterface, CheckToken,
        GenerateToken,
        FitData} from "../Cryptography/Authentication";
import { pgInterfaceUser } from "./User";

export default class ResponseJSON {
    version: string;
    isRunning: boolean;
    autenticate: boolean;
    databaseUp:boolean;
    tokenReturn: tokenReturnInterface;
    tokenInfo!:tokenInfoInterface;
    helloMessage?: JSON;
    tableData?: JSON;
    tableList?: string[];
    rowData?: JSON;
    requestData?: any;
    notAtackAccess?: boolean;
    accessmessage: string[];
    requestSucess?: boolean;
    feedbackString?: string;
    signUpData!: {
        signup: boolean,
        EmailExist: boolean,
        Email: string,
        message: string
    };
    loginData!:{
        login: boolean,
        message?: string
    };
    userData!:pgInterfaceUser;
    // ----------------------------------------------------------------------------
    constructor(){
        this.version = (process.env.API_VERSION === null || process.env.API_VERSION === undefined)? "0.0.0": process.env.API_VERSION;
        this.tokenReturn = {accessToken: "", exp: new Date()};;
        this.tokenInfo = {id: -1, validy: false};
        this.isRunning = true;
        this.autenticate = false;
        this.databaseUp = false;
        this.notAtackAccess = true;
        this.requestSucess = false;
        this.accessmessage = [];
    };
    // ----------------------------------------------------------------------------
    deauthenticate(){
        this.autenticate = false;
        this.tokenReturn = {accessToken: "", exp: new Date()};
        this.tokenInfo = {id: -1, validy: false};
        this.tableData = undefined;
        this.rowData = undefined;
        //this.userData = {};
    };
    // ----------------------------------------------------------------------------
    databaseIsUp(){
        this.databaseUp = true;
    };
    // ----------------------------------------------------------------------------
    async processAccessToken(token:string){
        var tokenInfo:tokenInfoInterface = {id: -1, exp: "", validy: false};
        token = FitData(token);
        if (( token === undefined) || (token.length < 136)){
            return;
        }
        let date_now = new Date();
        try{
            tokenInfo = await CheckToken(token);
            let date_exp = new Date((Number(tokenInfo.exp) - 5) * 1000 ); // - date_now.getTimezoneOffset());
            let tokenRenevalTime = (<number>((process.env.TOKEN_RENEVAL_TIME === undefined) ? 1 : <unknown>process.env.TOKEN_RENEVAL_TIME))
            if (tokenInfo.validy && 
                ((date_exp.getTime() - date_now.getTime())/(3600*1000) <  tokenRenevalTime) ){
                    token = GenerateToken(tokenInfo.id.toString());
                    tokenInfo = await CheckToken(token);
                    this.requestSucess = true;
            }
            this.databaseIsUp()
        } catch(err) {
            console.log("ERROR em processAccessToken() (token verify) em ResponseJSON: ", err.stack.split("at")[0]);
            throw err;
        } finally {
            this.tokenReturn = {accessToken: token, exp: new Date(Number(tokenInfo.exp) * 1000) };
            this.tokenInfo = tokenInfo;
            this.autenticate = (tokenInfo.validy === undefined ? false: tokenInfo.validy);
        }
    }
};