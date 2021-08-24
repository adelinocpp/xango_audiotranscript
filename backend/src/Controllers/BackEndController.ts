import { Request, Response, NextFunction } from "express";
import { StoreLogAccess } from "../Database/LogAccessTable";
import ResponseJSON from '../Models/ResponseJSON';
import { CheckDataBase} from "../Database/General";
import { GenerateprefixFrontEnd, stringInvalid } from "../Cryptography/CryptoString";


// cd node_modules/geoip-lite && npm run-script updatedb license_key=njGqcrR42kahp8mb
class BackEndController {
    async statusBackEnd(req: Request, res: Response) {
      var response = new ResponseJSON();
      await StoreLogAccess("-1",req,true);
      let JSONmessage = {Mensagem: "Olá esta é a página de testes de acesso ao banco de dados de Áudios para CFL!",
                    HEADERS: req.headers,
                    IP: req.ip,
                    IPS: req.ips,
                    hostname: req.hostname,
                    Original_URL: req.originalUrl,
                    PARAMS: req.params,
                    QUERY: req.query,
                    BODY: req.body,
                    URL:req.url};
      response.helloMessage = JSON.parse(JSON.stringify(JSONmessage));
      response.isRunning = true;
      response.databaseUp = await CheckDataBase();
      response.requestSucess = true;
      return res.status(200).json(response);
    }
    // ------------------------------------------------------------------------
    async prefixFrontEnd(req: Request, res: Response) {
      var numKeys = 10;
      if (!stringInvalid(req.query.numkey as string))
        numKeys = parseInt(req.query.numkey as string)
      var response = new ResponseJSON();
      let JSONmessage = GenerateprefixFrontEnd(numKeys);
      response.requestData = JSON.parse(JSON.stringify(JSONmessage));
      response.databaseIsUp();
      response.requestSucess = true;
      await StoreLogAccess("-1",req,true);
      return res.status(200).json(response);
    }
    // ------------------------------------------------------------------------
    async checkAcessToken(req: Request, res: Response){
      var response = new ResponseJSON();
      await response.processAccessToken(req.body.accessToken);
      response.databaseIsUp();
      response.requestSucess = true;
      await StoreLogAccess("-1",req,true);
      return res.status(200).json(response);
    }
}
export default new BackEndController();
