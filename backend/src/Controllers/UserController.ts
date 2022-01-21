import {pgInterfaceUser} from "../Models/User";
import { CheckUserOnDataBaseByKey, 
        GetUserID,
        GetUserById,
        AddUserOnDatabase,
        DeactivateUser,
        CheckEmailOnDataBase,
        ClearAccessKey} from "../Database/UserTable";
import {SendAccessKeyMail} from "../Communication/SendEmail";
import {CheckEmail, 
        EncriptPassWord,
        FitData, GenerateToken, DencriptPassWord} from "../Cryptography/Authentication";
require("dotenv").config();
import { Request, Response, NextFunction } from "express";
//require("dotenv").load();
import {StoreLogAccess,ValidateUserLogAccess} from "../Database/LogAccessTable";
import ResponseJSON from '../Models/ResponseJSON';
import { dencriptString } from "../Cryptography/CryptoString";

// ============================================================================
// --- Interfce de Usuário do sistema com o FORNTEND --------------------------
//  DONE: escrever a descricao destas funcoes
//
//  login: Recebe as credenciais de login e devolve um token (de acesso)
//
//  accessWithToken: acessa o sistema com um token (de acesso) válido
//
//  SignUp: Cadastra um usuário e retorna um token (de acesso) válido
//  
//  recoveryPassWord: Solicita e-mail de recuperação de senha
//
//  updatePassWord: Autiliza a senha de usuário com base em um token (e-mail)
//  
//  verifyUserById: Altera o status do usuário para verificado com base em um token (e-mail) 
//

// ============================================================================
class UserController {
    // ------------------------------------------------------------------------
    async logIn(req: Request, res: Response) {
        var returnJSON = new ResponseJSON;
        returnJSON.loginData = JSON.parse(JSON.stringify({
            message: "Falha ao realizar login."
        }));
        returnJSON.loginData.login = false;
        if (Object.keys(req.body).length === 0)
            return res.status(200).json(returnJSON);

        var keyToDataBase: string, pwToDataBase: boolean = false; 
        keyToDataBase = FitData(ClearAccessKey(req.body.userName));
        pwToDataBase = DencriptPassWord(FitData(req.body.userPassWord),keyToDataBase);
        var id:string = "-1";
        try {
            if (pwToDataBase)
                id = await CheckUserOnDataBaseByKey(keyToDataBase);
            if (id === "-1"){
                await StoreLogAccess(id,req,pwToDataBase);
                returnJSON.loginData.message = "Chave de acesso não encontrada na base de dados.";
            } else{
                await StoreLogAccess(id,req,pwToDataBase);
                if (pwToDataBase){
                    await returnJSON.processAccessToken(GenerateToken(id));
                    returnJSON.userData = await GetUserById(id);
                    returnJSON.requestSucess = true;
                    returnJSON.loginData.login = true;
                    returnJSON.loginData.message = "Login efetuado com sucesso.";
                } else{
                    returnJSON.notAtackAccess = await ValidateUserLogAccess(id);
                    console.log("Parece apenas uma falha (login access)?: ",returnJSON.notAtackAccess);
                    if (!returnJSON.notAtackAccess ){
                        await DeactivateUser(id);
                        returnJSON.loginData.message = "Chave de acesso bloqueada (por login) precisa de nova chave de acesso.";
                    }
                }
            }
        }catch (err:any){
            console.log("ERROR from login() in UserControllers: ", err.stack.split("at")[0]);
            // TODO: Adicionar mensagem no return JSON
        } finally{
            return res.status(200).json(returnJSON);
        }
    }
    // ------------------------------------------------------------------------
    async accessWithToken(req: Request, res: Response, next: NextFunction) {        
        // DONE: função enxuta versão 0.0.0
        var returnJSON = new ResponseJSON;
        var strVecMSG: string[] = [];
        returnJSON.databaseIsUp();
        try {
            await returnJSON.processAccessToken(<string>req.params.tokennum);
            if (!returnJSON.tokenInfo.validy)
                res.status(200).json(returnJSON);
            else{
                var id:string = returnJSON.tokenInfo.id.toString();
                if (id == "-1"){
                    await StoreLogAccess(returnJSON.tokenInfo.id.toString(),req,false);
                    returnJSON.accessmessage = ["Chave de acesso bloqueada ou inválida."];
                }
                await StoreLogAccess(id,req,returnJSON.autenticate);
                if (returnJSON.tokenInfo.validy) {  
                    returnJSON.requestSucess = true;
                    returnJSON.userData = await GetUserById(id);
                    strVecMSG = [...strVecMSG, "Usuário autenticado (via token) com sucesso."];
                    returnJSON.accessmessage = strVecMSG;
                    // return res.status(200).json(returnJSON);
                }
                else{
                    returnJSON.notAtackAccess = await ValidateUserLogAccess(id);
                    console.log("Parece apenas uma falha (token access)?: ",returnJSON.notAtackAccess);
                    if (returnJSON.notAtackAccess ){
                        strVecMSG = [...strVecMSG, "Falha ao autenticar usuário (via token). Token vencido."];
                        returnJSON.accessmessage = strVecMSG;
                        // return res.status(200).json(returnJSON);
                    }
                    else{
                        await DeactivateUser(id);
                        strVecMSG = [...strVecMSG, "Chave de acesso bloqueada (por token) precisa de nova chave de acesso."];
                        returnJSON.accessmessage = strVecMSG;
                        // return res.status(200).json(returnJSON);   
                    }
                }
                res.status(200).json(returnJSON);
            }
        } catch(err:any){
            console.log("ERROR from accessWithToken() in UserController: ", err.stack.split("at")[0]);

        } finally{
            return;
        }
    }
    // ------------------------------------------------------------------------
    async closeAccount(req: Request, res: Response) {
        // TODO: acertar essa função
        var returnJSON = new ResponseJSON;
        returnJSON.databaseIsUp();
        var userPassWord: string = FitData(ClearAccessKey(req.body.userPassWord)); // AccessKey
        if (!userPassWord || !CheckEmail(req.body.userEmail))
            return res.status(200).json(returnJSON);
        
        var keyToDataBase: string, pwToDataBase: boolean = false; 
        keyToDataBase = FitData(req.body.userName);
        console.log("userPassWord,keyToDataBase:",userPassWord,keyToDataBase)
        pwToDataBase = DencriptPassWord(FitData(req.body.userPassWord),keyToDataBase);
        // pwToDataBase = DencriptPassWord(userPassWord,keyToDataBase);

        // var token_id:string = "-1";
        try {
            console.log("userPassWord:",userPassWord)
            var id:string = await CheckUserOnDataBaseByKey(keyToDataBase);
            var email_id:string = await CheckEmailOnDataBase(req.body.userEmail);
            await returnJSON.processAccessToken(<string>req.params.tokennum);
            console.log("tokennum: ", id, returnJSON.tokenInfo.id.toString(), (id === "-1"),(id !== returnJSON.tokenInfo.id.toString()) )
            let boolAuthenticated:boolean = ((email_id === id) && (id !== "-1") && (Number(id) === returnJSON.tokenInfo.id));
            if (!boolAuthenticated){
                returnJSON.accessmessage = [...returnJSON.accessmessage, 
                    "Usuário não encontrado na base de dados. VErifique se os dados estão corretos."];
                // return res.status(200).json(returnJSON);
            } else{
              await StoreLogAccess(id,req,boolAuthenticated);
              console.log("boolAuthenticated: ",boolAuthenticated);
              if (boolAuthenticated){
                if(await DeactivateUser(id)){
                    returnJSON.requestSucess = true;
                    returnJSON.accessmessage = [...returnJSON.accessmessage, 
                        "Conta removida com sucesso. Chave de acesso é inválida."];
                    returnJSON.requestSucess = true;
                } else
                    returnJSON.accessmessage = [...returnJSON.accessmessage, 
                        "Conta não removida. Problemas no aceso ao banco de dados."];
              } else{
                returnJSON.notAtackAccess = await ValidateUserLogAccess(id);
                if (!returnJSON.notAtackAccess ){
                    await DeactivateUser(id);
                    returnJSON.accessmessage = ["Chave de acesso bloqueada (por token, em desativação) precisa de nova chave de acesso."];
                }
              }
          }
        }catch(err:any){
            console.log("ERROR from CloseAccount() in UserController: ", err.stack.split("at")[0]);
        } finally{
            return res.status(200).json(returnJSON);
        }
    }
    // ------------------------------------------------------------------------
    async signUp(req: Request, res: Response, next: NextFunction) {
        // DONE: função enxuta versão 0.0.0
        var returnJSON = new ResponseJSON;
        returnJSON.signUpData = JSON.parse(JSON.stringify({
            signup: false,
            UserExist: false,
            EmailExist: false,
            message: 'Falha no cadastro de usuário.'
        }));
        var passwordValid: boolean = 
                (dencriptString(req.body.userPassWord as string,"SIGNUP") 
                    === (process.env.PW_PREFIX as string));
        var userEmail: string = req.body.userEmail;
        if ( (!CheckEmail(req.body.userEmail)) || !passwordValid)
            return res.status(200).json(returnJSON);
        try {
            returnJSON.signUpData.EmailExist = ((await CheckEmailOnDataBase(userEmail)) !== "-1");
            if (!returnJSON.signUpData.EmailExist) {
                var newuser:pgInterfaceUser = { id: -1,
                    user_name: "", 
                    email: userEmail};
                const id: string = await AddUserOnDatabase(newuser);
                if (id !== "-1") {
                    SendAccessKeyMail(id);
                    returnJSON.signUpData.signup = true;
                    returnJSON.signUpData.Email = userEmail;
                    returnJSON.autenticate = true;
                    returnJSON.signUpData.message = "Cadastro realizado com sucesso.";
                    await StoreLogAccess(id,req,returnJSON.autenticate);   
                    returnJSON.requestSucess = true;
                    returnJSON.databaseIsUp(); 
                } else{
                    returnJSON.signUpData.message = "Falha ao cadastrar usuário na base de dados.";
                }
            } else {
                returnJSON.signUpData.message = "Falha ao cadastrar usuário. Verifique nome de usuário e e-mail.";
            }
        } catch (err:any) {
            console.log("ERROR from AddUserOnDatabase() in UserController: ", err.stack.split("at")[0]);
        } finally{
            return res.status(200).json(returnJSON);
        }
    };
    // ------------------------------------------------------------------------
    async recoveryPassWord(req: Request, res: Response, next: NextFunction) {
        // TODO: send email with key
        var returnJSON = new ResponseJSON;
        returnJSON.accessmessage = ["Falha ao recuperar senha de usuário."];
        if (!CheckEmail(req.body.userEmail))
            return res.status(200).json(returnJSON);

        var userEmail = req.body.userEmail;
        var id: string = "-1";
        var sendEmail:boolean = false;
        try {
            id = await CheckEmailOnDataBase(req.body.userEmail);
            // console.log("ID: ", id);
            if (id === "-1"){
                returnJSON.autenticate = false;
                returnJSON.accessmessage = [`Usuário ${req.body.userEmail} não foi encontrado na base de dados`];
            } else {
                SendAccessKeyMail(id);
                sendEmail = true;
                returnJSON.autenticate = true;
                returnJSON.accessmessage = [`Sucesso. Email de recuperação enviado para ${req.body.userEmail}.`];
                returnJSON.requestSucess = true;
            }
        } catch (e){
            returnJSON.accessmessage = ["Falha ao consultar a base de dados."];
        } finally{
            await StoreLogAccess(id,req,returnJSON.autenticate);   
            returnJSON.requestData = JSON.parse(JSON.stringify({
                sucess: sendEmail,
                userId: id,
                userEmail: userEmail,
            }));
            return res.status(200).json(returnJSON);
        }
    }
    // ------------------------------------------------------------------------
};

export default new UserController();