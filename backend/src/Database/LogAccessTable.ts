//import pgInterfaceLogAccess from "../Models/LogAccess";
import { Request } from "express";
import { Pool } from "pg";
import {connectionStringAdmim, connectionStringWebUser}  from "./General";
import {GetEventId} from "./EventsTable";
// ============================================================================
// --- Verificações na tabela de log de acesso do Usuário do sistema ----------
//
//  GetEventId: Obtem o id de um evento baseado no caminho da requisicao
//
//  ExtractRequestInformation: Extrai as informacoes da requisicao para armazenar no banco de dados
//
//  StoreLogAccess
//
//  ValidateUserLogAccess: 

// ----------------------------------------------------------------------------
function ExtractRequestInformation(req: Request, version: Number = 0):any{
    var returnJSON;
    // DONE: funcao pronta. PS: apenas versões 0
    switch (version)
    {
        default:
            returnJSON = {
                Version: version,
                IP: req.ip,
                IPS: req.ips,
                RealIP: req.headers['x-real-ip'],
                ForwardedIP: req.headers['x-forwarded-for'],
                RemoteAddressSocket: req.socket.remoteAddress,
                RemoteAddressConnection: req.connection.remoteAddress,
                URL:req.url,
                Params: req.params,
                Query: req.query,
                Body: req.body,
                Protocol: req.protocol,     
                HostName: req.hostname,     
                Path: req.path,         
                OriginalURL: req.originalUrl,  
                SubDomains: req.subdomains,    
                Method: req.method,
                ContentType: req.header('Content-Type'),
                UserAgent:  req.header('user-agent'),
                Authorization: req.header('Authorization'),
                cookies: req.cookies
            }
    }
    return returnJSON;
}
// ----------------------------------------------------------------------------
async function StoreLogAccess(user_id:string, req: Request, status: boolean):Promise<boolean>{
    var logVersion:Number = Number(process.env.LOG_VERSION),
        event_id:Number, storeStatus: boolean,
        queryString: string = "INSERT INTO log_events (access_keys_id,event_id,details,details_version) VALUES ($1,$2,$3,$4)";
    storeStatus = false;
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var StoredJson = ExtractRequestInformation(req, logVersion);
    StoredJson.status = status;
    event_id = await GetEventId(req);
    if (event_id === -1)
        return storeStatus;
    try {
        await pool.query(queryString, [user_id,event_id,StoredJson,StoredJson.Version]);
        pool.end();
        storeStatus = true;
    } catch(e) {
        console.log("ERROR from StoreLogAccess() in LogAccessTable: ",e.stack.split("at")[0]); 
    }  finally {
        return storeStatus;
    }
}
// ----------------------------------------------------------------------------
async function ValidateUserLogAccess(user_id:string):Promise<boolean>{
    var nTent = Number(process.env.NUM_LOGIN);
    var nSeconds = Number(process.env.TIME_LOGIN);
    var queryString: string, CS: string;
    var successiveSucess: boolean = false,
        timeFailure: boolean = false,
        returnValue: boolean = false;
    var event_id: Number;
    var result: any;
    
    CS = connectionStringWebUser;
    event_id = await GetEventId(undefined, "/login");
    queryString = "SELECT * FROM log_events WHERE access_keys_id = $1  AND event_id = $2 ORDER BY created DESC LIMIT $3;"
    const pool = new Pool({ connectionString: CS }); 
    try {
        result = await pool.query(queryString, [user_id,event_id,nTent]);
        pool.end();
        //console.log("Validade USER: ", result.rowCount);
        if (result.rowCount === nTent)
        {
            var jsonDetailsI;
            var statusI: string;
            for (let i = 0; i < nTent; i++){
                jsonDetailsI = result.rows[i].details;
                statusI = <string>jsonDetailsI.status;
                successiveSucess = successiveSucess || (statusI.toString() === "true");
                //console.log(statusI, "R: ",(statusI.toString() === "true"), " - successiveSucess ",i," :", successiveSucess);
            }
            if (!successiveSucess)
                timeFailure = ((result.rows[0].created - result.rows[nTent-1].created)/1000 < nSeconds);
            //console.log("Pelo menos um sucessos em ", nTent," sucessivos: ", successiveSucess);
            //console.log("Falha tempo: ",timeFailure);
            //console.log("Pelo menos um sucesso sucessivo: ", successiveSucess);
            returnValue = (!timeFailure || successiveSucess);
        }
        else
            returnValue = true;
    } catch(e) {
        console.log("ERROR from ValidateUserLogAccess() in LogAccessTable: ",e.stack.split("at")[0]); // 30
        returnValue = false;
    }  finally {
        return returnValue;
    }
}
// ----------------------------------------------------------------------------

export {StoreLogAccess, ValidateUserLogAccess};