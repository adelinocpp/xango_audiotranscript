require("dotenv").config();
import { Request, Response, NextFunction } from "express";
// import shell from "shelljs";
// import fs from "fs";
// import util from "util";
// import path from "path";
import ResponseJSON from "../Models/ResponseJSON";
import { StoreLogAccess } from "../Database/LogAccessTable";
import { GenerateFileToDownload, removeDownloadFile } from "../Database/AudioFileTable";
import { itfFullFilePath, pgInterfaceDownloadFile } from "../Models/User";
import { AddDownloadFile } from "../Database/DownloadTable";



class DownloadController {
    async getFile(req: Request, res: Response, next: NextFunction) {
      // TODO: compactar arquivo comas TAGS
      var returnJSON = new ResponseJSON;
        var strListOfFiles: string = req.query.FileId as string;
        returnJSON.databaseIsUp();
        var fullFilePath:itfFullFilePath = {};
        if (req.query.FileId === undefined){
          res.status(200).json(returnJSON);
          return 
        }
        else{
          var downloadFileData:pgInterfaceDownloadFile={}
          try {
              await returnJSON.processAccessToken(<string>req.query.tokennum);
              if (!returnJSON.tokenInfo.validy)
                  return res.status(200).json(returnJSON);
              var id:string = returnJSON.tokenInfo.id.toString();
              if (id == "-1"){
                  await StoreLogAccess(returnJSON.tokenInfo.id.toString(),req,false);
                  returnJSON.accessmessage = ["Chave de acesso bloqueada ou inválida."];
                  // res.status(200).json(returnJSON);
              }
              await StoreLogAccess(id,req,returnJSON.autenticate);
              if (returnJSON.tokenInfo.validy) {  
                fullFilePath = await GenerateFileToDownload(id,strListOfFiles);
                if (fullFilePath.fileName === undefined){
                  returnJSON.accessmessage = [...returnJSON.accessmessage, 
                  "Falha na geração do arquivo. Verifique a lista solicitada."]
                }else {
                  const options = {
                    headers: { 
                      'x-timestamp': Date.now(),
                      'x-sent': true,
                      'Content-disposition': "attachment; filename=" + `${fullFilePath.fileName}`, // gets ignored
                      'Content-type': "zip",
                      // 'filename': `${fullFilePath.fileName}`
                    }
                  }
                  downloadFileData = { 
                    access_keys_id: Number(id),
                    hash_md5: fullFilePath.hashMD5,
                    file_full_path: fullFilePath.fullFilePath,
                    audio_ids: strListOfFiles.replace("(","{\"").replace(")","\"}").replace(/,/g,"\",\"")
                  };
                  downloadFileData = await AddDownloadFile(downloadFileData);
                  returnJSON.requestData = downloadFileData;
                  let fileName = fullFilePath.fileName as string;
                  const filePath = fullFilePath.fullFilePath as string;
                  res.setHeader('filename',fullFilePath.fileName)
                  res.download(
                    filePath,
                    fileName,
                    options
                  );
                  returnJSON.requestSucess = true;
                  console.log("File sent successfully:", fullFilePath.fileName);
                }
              }
          } catch(err:any){
              console.log("ERROR from getFile() in DownloadController: ", err.stack.split("at")[0]);
              console.error("File could not be sent!");
              next(err);
          } finally{
              if (returnJSON.requestSucess)
                await removeDownloadFile(downloadFileData.id);
              return;
          }
      }
    }
    // ------------------------------------------------------------------------
}
export default new DownloadController();