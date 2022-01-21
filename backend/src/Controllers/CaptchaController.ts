require("dotenv").config();
import { Request, Response } from "express";
import fs from "fs";
import child from "child_process";
import util from "util";
import path from "path";
import { StoreLogAccess } from "../Database/LogAccessTable";
import { interfaceCaptcha } from "../Models/User";

// ----------------------------------------------------------------------------
class CaptchaControler {
    async getNewCaptcha(req: Request, res: Response) {
        var CaptchaGenPath: string;
        var strConsoleCommand: string;
        var id_client: string = req.params.id_client;
        var captchaDir = process.env.CAPTCHA_FOLDER === undefined? 
                            "../captcha": process.env.CAPTCHA_FOLDER
        CaptchaGenPath = path.resolve(__dirname, captchaDir);
        strConsoleCommand = CaptchaGenPath + "/CaptchaGen "
            + id_client;
        var json_file:string
        var json_obj:interfaceCaptcha = {};
        var generateSucess = false;
        try {
            const exec_command = util.promisify(child.exec);
            var { stdout, stderr } = await exec_command(strConsoleCommand);
            json_file = fs.readFileSync(stdout.replace(/\n/g, ''), "utf8");
            var json_obj = JSON.parse(json_file) as interfaceCaptcha;
            strConsoleCommand = "rm " + stdout.replace(/\n/g, '');
            var { stdout, stderr } = await exec_command(strConsoleCommand);
            var img_file = fs.readFileSync(json_obj.img_file_name as string, "base64");
            json_obj.img_data = img_file;
            strConsoleCommand = "rm " + json_obj.img_file_name;
            var { stdout, stderr } = await exec_command(strConsoleCommand);
            generateSucess = true;
        }
        catch (e:any) {
            console.log("ERROR from GetNewCaptcha() in CaptchaController: ",e.stack.split("at")[0]); // 30
            generateSucess = false;
        }
        finally{
            await StoreLogAccess("-1",req,generateSucess);
        }
        return res.status(200).json(json_obj);
    }
}
// ----------------------------------------------------------------------------
export default new CaptchaControler();
