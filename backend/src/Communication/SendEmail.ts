require("dotenv").config();
import {GetAccessKeyById, GetUserEmailById, printConvite} from "../Database/UserTable";
import nodemailer from "nodemailer";
import { genHTMLAccessKeyEmail, genTXTAccessKeyEmail } from "./EmailText";

// ----------------------------------------------------------------------------
async function SendAccessKeyMail(id: string):Promise<boolean>{
    var got_email:string = "",
        accessKey: string;

    try{
        got_email = await GetUserEmailById(id);
        accessKey = await GetAccessKeyById(id);
        if (got_email === "") {
            return false;
        }    
        var textmail: string = genTXTAccessKeyEmail(got_email,printConvite(accessKey));
        var htmlmail: string = genHTMLAccessKeyEmail(got_email,printConvite(accessKey));
        var emailASerEnviado = {
            from: process.env.EMAIL_FROM,
            to: got_email,
            subject: "[Base de Áudios para CFL] Chave de Acesso.",
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
        sendStatus = await remetente.sendMail(emailASerEnviado) 
    } catch(e:any){
        console.log("ERROR from SendAccessKeyMail() on function SendEmail: ", e.stack ); // e.stack.split("at")[0]
    }finally{
        return (sendStatus.accepted[0] === got_email);
    }    
}
// ----------------------------------------------------------------------------
export {SendAccessKeyMail};