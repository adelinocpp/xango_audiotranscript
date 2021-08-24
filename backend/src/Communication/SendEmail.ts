require("dotenv").config();
// import { Pool } from "pg";
import {GetUserEmailById, GetUserUserNameById} from "../Database/UserTable";
//import {EncriptString, DencriptString} from "../Cryptography/CryptoString";
import {GenerateToken} from "../Cryptography/Authentication";
//import {connectionString}  from "./General";
import nodemailer from "nodemailer";
import i18n from "../LanguageProvider";
// import {connectionStringAdmim, SolveUserNameById}  from "../Database/General";
import {pgInterfaceExtraEmail} from "../Models/ExtraEmail";
import {getExtraEmailById} from "../Database/ExtraEmailTable";
import { genHTMLRecoveryPassWordEmail, genHTMLVerifyEmail, genHTMLVerifyExtraEmail, genHTMLWelcomeEmail } from "./EmailText";

// ----------------------------------------------------------------------------
async function SendVerifyEmail(id: string, language: string="pt"):Promise<boolean>{
    var got_email:string,
        got_username:string,
        verify_address: string = "verify_user";

    got_email = await GetUserEmailById(id);
    got_username = await GetUserUserNameById(id);
    if ((got_email === "") || ( got_username === "")) {
        return false;
    }
    var token = GenerateToken(id, false);
    i18n.changeLanguage(language);
    var fullLinkAccess = `http://${process.env.HOST}:${process.env.FRONT_END_PORT}/${verify_address}/${token}`; 
    var textmail: string = " Olá " +
                        got_username + "\r\r Estamos enviando este e-mail para verificar o cadastro de sua conta no sistema Lwano. Para confirmar seu endereço de e-mail clique no link a seguir.\r\r" +
                        fullLinkAccess +
                        "Se você não tiver feito este pedido, ignore esta mensagem. O link ficará disponível por 24 horas.\r\rMuito obrigado\r\r Dr. Adelino Pinheiro Silva\rPerito Criminal Oficial\rInstituto de Criminalística de Minas Gerais\rTel: (31) 3330-1723.\rWhatsapp: (31) 98801-3605.\rEmail: adelino.pinheiro@pc.mg.gov.br";

    var htmlmail: string = genHTMLVerifyEmail(got_username,fullLinkAccess);
    var emailASerEnviado = {
        from: process.env.EMAIL_FROM,
        to: got_email,
        subject: "[LWANO] Verificação de endereço de e-mail.",
        text: textmail,
        html: htmlmail,
    };
    var remetente = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP,
        service: process.env.EMAIL_SMTP,
        port: Number(process.env.EMAIL_PORT),
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });
    var sendStatus: any;
    try{
        sendStatus = await remetente.sendMail(emailASerEnviado) 
    } catch(e){
        console.log("ERROR from SendVerifyEmail() on class SendEmail: ", e.stack ); // e.stack.split("at")[0]
    }finally{
        return (sendStatus.accepted[0] === got_email);
    }    
}
// ----------------------------------------------------------------------------
async function SendVerifyExtraEmail(id: string, language: string="pt"):Promise<boolean>{
    var user_id:number,
        got_email:string,
        got_username:string,
        extraEmailData:pgInterfaceExtraEmail[],
        verify_address: string = "verify_extraemail";


    extraEmailData = await getExtraEmailById(id);
    // console.log("Envio extra mail, extraEmailData...", extraEmailData)
    user_id = (extraEmailData[0].user_id === undefined) ? -1: extraEmailData[0].user_id;
    got_email = (extraEmailData[0].email === undefined) ? "": extraEmailData[0].email;
    got_username = await GetUserUserNameById(user_id.toString());
    
    if ((got_email === "") || ( got_username === "")) {
        return false;
    }
    var token = GenerateToken(id, false);
    i18n.changeLanguage(language);
    var fullLinkAccess = `http://${process.env.FRONT_END_ADRESS}:${process.env.FRONT_END_PORT}/${verify_address}/${token}`; 
    var textmail: string = "Verificação de email " +
                        got_username + " " + 
                        i18n.t("verify_password.before_link") +
                        `http://${process.env.HOST}:${process.env.HTTP_PORT}/${verify_address}/${token}` +
                        i18n.t("verify_password.after_link") +
                        i18n.t("verify_password.farewell") +
                        i18n.t("verify_password.signature");

    var htmlmail: string = genHTMLVerifyExtraEmail(got_username,fullLinkAccess);
    var emailASerEnviado = {
        from: process.env.EMAIL_FROM,
        to: got_email,
        subject: "[LWANO] Verificação de endereço de e-mail.",
        text: textmail,
        html: htmlmail,
    };
    var remetente = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP,
        service: process.env.EMAIL_SMTP,
        port: Number(process.env.EMAIL_PORT),
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });
    // console.log("Envio extra mail...")
    var sendStatus: any;
    try{
        sendStatus = await remetente.sendMail(emailASerEnviado) 
    } catch(e){
        console.log("ERROR from SendVerifyEmail() on class SendEmail: ", e.stack ); // e.stack.split("at")[0]
    }finally{
        return (sendStatus.accepted[0] === got_email);
    }
}
// ----------------------------------------------------------------------------
async function SendRecoveryPassWordEmail(id: string, language: string="pt"):Promise<boolean>{
    var got_email:string,
        got_username:string,
        verify_address: string = "recoverypassword";
    
    got_email = await GetUserEmailById(id);
    got_username = await GetUserUserNameById(id);
    if ((got_email === "") || ( got_username === "")) {
        return false;
    }
    var token = GenerateToken(id, false);
    i18n.changeLanguage(language);
    var fullLinkAccess = `http://${process.env.FRONT_END_ADRESS}:${process.env.FRONT_END_PORT}/${verify_address}/${token}`; 
    var textmail: string = i18n.t("recovery_password.salutation") +
                        got_username +
                        i18n.t("recovery_password.before_link") +
                        `https://${process.env.FRONT_END_ADRESS}:${process.env.FRONT_END_PORT}/${verify_address}/${token}` +
                        i18n.t("recovery_password.after_link") +
                        i18n.t("recovery_password.farewell") +
                        i18n.t("recovery_password.signature");

    var htmlmail: string = genHTMLRecoveryPassWordEmail(got_username,fullLinkAccess);
    var emailASerEnviado = {
        from: process.env.EMAIL_FROM,
        to: got_email,
        subject: "[LWANO] Solicitação para redefinir senha.",
        text: textmail,
        html: htmlmail,
    };
    var remetente = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP,
        service: process.env.EMAIL_SMTP,
        port: Number(process.env.EMAIL_PORT),
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });
    var sendStatus: any;
    try{
        sendStatus = await remetente.sendMail(emailASerEnviado) 
    } catch(e){
        console.log("ERROR from SendVerifyEmail() on class SendEmail: ", e.stack ); // e.stack.split("at")[0]
    }finally{
        return (sendStatus.accepted[0] === got_email);
    }
}
// ----------------------------------------------------------------------------
async function sendUserWelcomeEmail(id: string, language: string="pt"):Promise<boolean>{
    var got_email:string,
    got_username:string;

    got_email = await GetUserEmailById(id);
    got_username = await GetUserUserNameById(id);
    if ((got_email === "") || ( got_username === "")) {
        return false;
    }
    var fullLinkAccess = `http://${process.env.FRONT_END_ADRESS}:${process.env.FRONT_END_PORT}`; 
    i18n.changeLanguage(language);
    var textmail: string = i18n.t("Wellcome_email.salutation") +
                        got_username +
                        i18n.t("Wellcome_email.before_link") +
                        i18n.t("Wellcome_email.farewell") +
                        i18n.t("Wellcome_email.signature");

    var htmlmail: string = genHTMLWelcomeEmail(got_username,fullLinkAccess);
    var emailASerEnviado = {
        from: process.env.EMAIL_FROM,
        to: got_email,
        subject: "[LWANO] Bem vindo a LWANO.",
        text: textmail,
        html: htmlmail,
    };
    var remetente = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP,
        service: process.env.EMAIL_SMTP,
        port: Number(process.env.EMAIL_PORT),
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });
    
    var sendStatus: any;
    try{
        sendStatus = await remetente.sendMail(emailASerEnviado) 
    } catch(e){
        console.log("ERROR from SendVerifyEmail() on class SendEmail: ", e.stack ); // e.stack.split("at")[0]
    }finally{
        return (sendStatus.accepted[0] === got_email);
    }
}
// ----------------------------------------------------------------------------
export {SendVerifyEmail,
        SendVerifyExtraEmail,
        SendRecoveryPassWordEmail,
        sendUserWelcomeEmail};