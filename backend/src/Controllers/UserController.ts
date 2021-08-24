import {pgInterfaceUser} from "../Models/User";
import { CheckUserOnDataBase, 
        GetUserID,
        GetUserById,
        GetUserEmailById,
        GetUserUserNameById,
        CheckUserPW,
        AddUserOnDatabase,
        VerifyUser,
        CheckUserVerify,
        CheckUserNeedPwUpdate,
        CheckPasswordAreadyUpdated,
        UpdatePasswordById,
        ChangeUserEmail,
        RemUserFromDataBaseById,
        DeactivateUser,
        CheckEmailOnDataBase} from "../Database/UserTable";
import {SendVerifyEmail,
        SendRecoveryPassWordEmail,
        sendUserWelcomeEmail} from "../Communication/SendEmail";
import {tokenInfoInterface, 
        CheckEmail, 
        EncriptPassWord, CheckToken,
        FitData, GenerateToken, DencriptPassWord} from "../Cryptography/Authentication";
require("dotenv").config();
import { Request, Response, NextFunction } from "express";
//require("dotenv").load();
import {StoreLogAccess,ValidateUserLogAccess} from "../Database/LogAccessTable";
import ResponseJSON from '../Models/ResponseJSON';

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
    async login(req: Request, res: Response) {
        // TODO: 
        var returnJSON = new ResponseJSON;
        returnJSON.loginData = JSON.parse(JSON.stringify({
            message: "Falha ao realizar login."
        }));
        returnJSON.loginData.login = false;
        if (Object.keys(req.body).length === 0)
            return res.status(200).json(returnJSON);

        var keyToDataBase: string, pwToDataBase: boolean = false; 
        keyToDataBase = FitData(req.body.userName);
        pwToDataBase = DencriptPassWord(req.body.userPassWord,keyToDataBase);
        var id:string = "-1";

        if (pwToDataBase)
            id = await CheckUserOnDataBase(keyToDataBase);
        
        if (id === "-1"){
            returnJSON.loginData.message = "Chave de acesso não encontrada na base de dados.";
            return res.status(200).json(returnJSON);
        }
        await StoreLogAccess(id,req,pwToDataBase);
        if (pwToDataBase){
            await returnJSON.processAccessToken(GenerateToken(id));
            returnJSON.userData = await GetUserById(id);
            returnJSON.requestSucess = true;
            returnJSON.loginData.login = true;
            returnJSON.loginData.message = "Login efetuado com sucesso.";
            return res.status(200).json(returnJSON);
        } else{
            returnJSON.notAtackAccess = await ValidateUserLogAccess(id);
            console.log("Parece apenas uma falha (login access)?: ",returnJSON.notAtackAccess);
            if (returnJSON.notAtackAccess ){
                return res.status(200).json(returnJSON);
            } else{
                await DeactivateUser(id);
                returnJSON.loginData.message = "Chave de acesso bloqueada (por login) precisa de nova chave de acesso.";
                return res.status(200).json(returnJSON);
            }
        }
    }
    // ------------------------------------------------------------------------
    async accessWithToken(req: Request, res: Response, next: NextFunction) {        
        // DONE: função enxuta versão 0.0.0
        var returnJSON = new ResponseJSON;
        var strVecMSG: string[] = [];
        returnJSON.databaseIsUp();
        await returnJSON.processAccessToken(<string>req.params.tokennum);
        if (!returnJSON.tokenInfo.validy)
            return res.status(200).json(returnJSON);
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
            return res.status(200).json(returnJSON);
        }
        else{
            returnJSON.notAtackAccess = await ValidateUserLogAccess(id);
            console.log("Parece apenas uma falha (token access)?: ",returnJSON.notAtackAccess);
            if (returnJSON.notAtackAccess ){
                strVecMSG = [...strVecMSG, "Falha ao autenticar usuário (via token). Token vencido."];
                returnJSON.accessmessage = strVecMSG;
                return res.status(200).json(returnJSON);
            }
            else{
                await DeactivateUser(id);
                strVecMSG = [...strVecMSG, "Chave de acesso bloqueada (por token) precisa de nova chave de acesso."];
                returnJSON.accessmessage = strVecMSG;
                return res.status(200).json(returnJSON);   
            }
        }
    }
    // ------------------------------------------------------------------------
    async CloseAccount(req: Request, res: Response) {
        // TODO: acertar essa função
        var returnJSON = new ResponseJSON;
        await returnJSON.processAccessToken(<string>req.params.tokennum);
        returnJSON.databaseIsUp();
    
        var userName: string = FitData(req.body.userName);
        var userPassWord: string = req.body.userPassWord;
        if ((userName === "") || (!userPassWord))
            return res.status(200).json(returnJSON);
        var nameToDataBase: string, pwToDataBase: string, 
            ckUserPassWord, ckUsername, ckUserEmail, passwordNeedUpdate, emailOK: boolean = false, 
        pwToDataBase = EncriptPassWord(req.body.userPassWord);
        emailOK = CheckEmail(FitData(req.body.userName));
        nameToDataBase = FitData(req.body.userName);
        var id:string = "-1";
        try {
            ckUsername = await CheckUserOnDataBase(nameToDataBase);
            if (emailOK)
                ckUserEmail  = await CheckUserOnDataBase(req.body.userName);
            if (ckUsername)
                id = await GetUserID(nameToDataBase);
            if (ckUserEmail)
                id = await GetUserID(nameToDataBase); 
            console.log("tokennum: ", id, returnJSON.tokenInfo.id.toString(), (id === "-1"),(id !== returnJSON.tokenInfo.id.toString()) )
            if ( (id === "-1") || (Number(id) !== returnJSON.tokenInfo.id) ){
                returnJSON.accessmessage = [...returnJSON.accessmessage, 
                    "Usuário não encontrado na base de dados."];
                return res.status(200).json(returnJSON);
            }
            ckUserPassWord = await CheckUserPW(id,pwToDataBase); 
            passwordNeedUpdate = await CheckUserNeedPwUpdate(id);
            
            let boolAuthenticated:boolean = ( (ckUsername || ckUserEmail) 
                && ckUserPassWord && !passwordNeedUpdate) as boolean;
            await StoreLogAccess(id,req,boolAuthenticated);
            console.log("boolAuthenticated: ",(ckUsername || ckUserEmail),ckUserPassWord,!passwordNeedUpdate);
            if (boolAuthenticated){
                if(await DeactivateUser(id)){
                    returnJSON.requestSucess = true;
                    returnJSON.accessmessage = [...returnJSON.accessmessage, 
                        "Conta removida com sucesso."];
                    returnJSON.requestSucess = true;
                }
                else
                    returnJSON.accessmessage = [...returnJSON.accessmessage, 
                        "Conta não removida. Problemas no aceso ao banco de dados."];
                //return res.status(200).json(returnJSON);
            } else{
                returnJSON.notAtackAccess = await ValidateUserLogAccess(id);
                if (returnJSON.notAtackAccess ){
                    //return res.status(200).json(returnJSON);
                } else{
                    await DeactivateUser(id);
                    returnJSON.accessmessage = ["Usuário (bloqueado) precisa atualizar senha."];
                    //return res.status(200).json(returnJSON);
                }
            }
        }catch(err){
            console.log("ERROR from CloseAccount() in UserController: ", err.stack.split("at")[0]);
            //return res.status(200).json(returnJSON);
        } finally{
            return res.status(200).json(returnJSON);
        }
    }
    // ------------------------------------------------------------------------
    async SignUp(req: Request, res: Response, next: NextFunction) {
        // DONE: função enxuta versão 0.0.0
        var returnJSON = new ResponseJSON;
        returnJSON.signUpData = JSON.parse(JSON.stringify({
            signup: false,
            UserExist: false,
            EmailExist: false,
            message: 'Falha no cadastro de usuário.'
        }));
        
        var userEmail: string = req.body.userEmail;
        if (!CheckEmail(req.body.userEmail))
            return res.status(200).json(returnJSON);
        try {
            returnJSON.signUpData.EmailExist = ((await CheckEmailOnDataBase(userEmail)) !== "-1");
            if (!returnJSON.signUpData.EmailExist) {
                var newuser:pgInterfaceUser = { id: -1,
                    user_name: "", 
                    email: userEmail};
                const id: string = await AddUserOnDatabase(newuser);
                if (id !== "-1") {
                    // TODO: send access key email
                    SendVerifyEmail(id,"pt");
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
        } catch (err) {
            console.log("ERROR from AddUserOnDatabase() in UserController: ", err.stack.split("at")[0]);
        } finally{
            return res.status(200).json(returnJSON);
        }
    };
    // ------------------------------------------------------------------------
    async recoveryPassWord(req: Request, res: Response, next: NextFunction) {
        // TODO: send email with key
        var returnJSON = new ResponseJSON;
        var Message:string = "Falha ao recuperar senha de usuário.";
        var userName = FitData(req.body.userName);
        var userEmail:string = "";
        var id: string = "-1";
        var sendEmail:boolean = false;
        try {
            id = await GetUserID(userName);
            console.log("ID: ", id);

            if (id === "-1"){
                returnJSON.autenticate = false;
                Message = `Usuário ${req.body.userName} não foi encontrado na base de dados`;
            } else {
                userEmail = await GetUserEmailById(id);
                // console.log("curr lang: ",currlanguage, "send lang: ",req.body.language.replace(/\s/g, ""));
                SendRecoveryPassWordEmail(id,"pt");
                sendEmail = true;
                returnJSON.autenticate = true;
                Message = `Sucesso. Email de recuperação enviado para ${userEmail}.`;
                returnJSON.requestSucess = true;
            }
        } catch (e){
            Message = "Falha ao consultar a base de dados.";
        } finally{
            returnJSON.requestData = JSON.parse(JSON.stringify({
                sucess: sendEmail,
                userId: id,
                userName: userName,
                userEmail: userEmail,
                message: Message
            }));
            return res.status(200).json(returnJSON);
        }
    }
    // ------------------------------------------------------------------------
};

export default new UserController();