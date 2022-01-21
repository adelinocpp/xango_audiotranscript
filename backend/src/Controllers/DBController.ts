import {FitData} from "../Cryptography/Authentication";
import {getAllDataFromTable, getListOfTablesByUserId} from "../Database/General";
import { Request, Response, NextFunction, response } from "express";
import ResponseJSON from '../Models/ResponseJSON';
//import { CheckUserOnDataBase } from "../Database/UserTable";
import { StoreLogAccess } from "../Database/LogAccessTable";
import { stringInvalid } from "../Cryptography/CryptoString";
// ============================================================================
// --- Interfce para acesso a base de dados  do sistema com o FORNTEND 
//
//  checkDB: Verifica se o banco de dados está em funcionamento
//
//  getTables: obtem a lista de tabelas no SCHEMA public
//  
//  getTable: Obtem os dados de uma tabela especifica
//
//  getDecriptTable: Obtem dados descriptografados da tabela USERs
//
//  getEvents: Obtem os dados da tabela Events (tipos de eventos)
//
//  getUsersLogEvents: Obtem os dados da tabela de log de eventos de usuarios
//
//  checkUser: Verifica se um nome de usuário ou e-mail está livre
//
//
// ============================================================================
class DBController{
    // ------------------------------------------------------------------------
    async checkDB(req: Request, res: Response) {
        var response = new ResponseJSON();
        await response.processAccessToken(<string>req.query.tokennum);
        if (response.tokenInfo.validy){
            response.autenticate = true;
            response.databaseIsUp();
            // response.databaseUp = await CheckDataBase();
        }
        await StoreLogAccess("-1",req, response.autenticate);
        response.requestSucess = true;
        return res.status(200).json(response);
    }
    // ------------------------------------------------------------------------
    async getTables(req: Request, res: Response) {
        var response = new ResponseJSON();
        try{
            await response.processAccessToken(<string>req.params.tokennum);
            if (response.tokenInfo.validy){
                response.tableList = await getListOfTablesByUserId(response.tokenInfo.id.toString());
                response.requestSucess = true;
            }
        }catch (err:any){
            console.log("ERROR from getTables() on class DBController: ", err.stack.split("at")[0]); // 30
            response.accessmessage = ["Falha oa obter tabela. Tabela inesistente ou usuário não autorizado."];
        } finally{
            return res.status(200).json(response);
        }
    }
    // ------------------------------------------------------------------------
    // async listTable(req: Request, res: Response) {
    //     var returnJSON = new ResponseJSON();
    //     try{
    //         await returnJSON.processAccessToken(<string>req.query.tokennum);
    //         var TableName: string = FitData(<string>req.query.table);
    //         // var tableAccess: boolean = await checkTableAccess(TableName,returnJSON.tokenInfo.id.toString(), 'listTable');
    //         if (returnJSON.tokenInfo.validy){  //&& TableExist
    //             returnJSON.autenticate = true;
    //             returnJSON.tableData = JSON.parse(JSON.stringify(await getAllDataFromTable(TableName)));
    //             returnJSON.requestSucess = true;
    //         }
    //     }catch (err:any){
    //         console.log("ERROR from listTable() on class DBController: ", err.stack.split("at")[0]); // 30
    //         returnJSON.accessmessage = ["Falha oa obter tabela. Tabela inesistente ou usuário não autorizado."];
    //     }
    //     finally{
    //         return res.status(200).json(returnJSON);
    //     }
    // }
    // ------------------------------------------------------------------------
    // async listTableByUser(req: Request, res: Response) {
    //     var returnJSON = new ResponseJSON();
    //     try{
    //         await returnJSON.processAccessToken(<string>req.query.tokennum);
    //         var TableName: string = FitData(<string>req.query.table);
    //         if (returnJSON.tokenInfo.validy){  //&& TableExist
    //             returnJSON.autenticate = true;
    //             returnJSON.tableData = JSON.parse(JSON.stringify(await getAllDataFromTable(TableName,returnJSON.tokenInfo.id.toString())));
    //             returnJSON.requestSucess = true;
    //         }
    //     }catch (e:any){
    //         console.log("ERROR from listTableByUser() on class DBController: ", e.stack.split("at")[0]); // 30
    //         returnJSON.accessmessage = ["Falha oa obter tabela. Tabela inesistente ou usuário não autorizado."];
    //     }
    //     finally{
    //         return res.status(200).json(returnJSON);
    //     }
    // }
    // ------------------------------------------------------------------------
    async searchOnTable(req: Request, res: Response) {
        var returnJSON = new ResponseJSON();
        // console.log("Search on table:",req.url)
        try{
            await returnJSON.processAccessToken(<string>req.query.tokennum);
            var TableName: string = FitData(<string>req.query.table);
            var deactivate: boolean = stringInvalid(<string>req.query.deactivate)? false :(req.query.deactivate === "true");
            var decript: boolean = stringInvalid(<string>req.query.decript)? false :(req.query.decript === "true");
            
            if (returnJSON.tokenInfo.validy){  //&& TableExist
                returnJSON.autenticate = true;
                returnJSON.requestData = TableName;
                returnJSON.tableData = JSON.parse(JSON.stringify(
                        await getAllDataFromTable(TableName,returnJSON.tokenInfo.id.toString(),deactivate,decript)
                        ));
                returnJSON.requestSucess = true;
            }
        }catch (e:any){
            console.log("ERROR from searchOnTable() on class DBController: ", e.stack.split("at")[0]); // 30
            returnJSON.accessmessage = ["Falha oa obter tabela. Tabela inesistente ou usuário não autorizado."];
        }
        finally{
            return res.status(200).json(returnJSON);
        }
    }
    // ------------------------------------------------------------------------
    // async searchOnTableByUser(req: Request, res: Response) {
    //     var returnJSON = new ResponseJSON();
    //     return res.status(200).json(returnJSON);
    // }
}
// ------------------------------------------------------------------------
export default new DBController();