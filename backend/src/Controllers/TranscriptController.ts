require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import ResponseJSON from "../Models/ResponseJSON";
import { StoreLogAccess } from "../Database/LogAccessTable";
import { itfFullFilePath, pgInterfaceAudioFileTranscript, pgInterfaceDownloadFile, pgInterfaceTranscriptFile } from "../Models/User";
import { DeactivateTranscriptFile, finishTrancriptProcess, getAudioForTrancript, GetTranscripFileByAudioID, startTranscript } from "../Database/TranscriptTable";
import { ExtractFileName, FitData, GenerateToken } from "../Cryptography/Authentication";
import { dencriptString } from "../Cryptography/CryptoString";
import path from "path";

class TranscriptController {
  async requestTrancript(req: Request, res: Response, next: NextFunction) {
    var returnJSON = new ResponseJSON;
    var audioId: string = req.body.FileId as string;
    returnJSON.databaseIsUp();
    if (req.body.FileId === undefined){
      res.status(200).json(returnJSON);
      return 
    }
    else{
      try {
        await returnJSON.processAccessToken(<string>req.body.tokennum);
        var id:string = returnJSON.tokenInfo.id.toString();
        if ((!returnJSON.tokenInfo.validy) || 
            (id === '-1')){
          returnJSON.accessmessage = ["Chave de acesso bloqueada ou inválida."];
          await StoreLogAccess(returnJSON.tokenInfo.id.toString(),req,false);
          return res.status(200).json(returnJSON);
        }                  
        await StoreLogAccess(id,req,returnJSON.autenticate);
        if (returnJSON.tokenInfo.validy) {  
          var transcripData:pgInterfaceTranscriptFile = await startTranscript(audioId,id);
          switch (transcripData.status){
            case 'FAILED_ACCESS':
              returnJSON.accessmessage = [...returnJSON.accessmessage, 
                "Falha na solicitação da transcrição. Arquivo de áudio não acessível ao usuário."]
              break;
            case 'FAILED_RUN':
              returnJSON.accessmessage = [...returnJSON.accessmessage, 
                "Falha na solicitação da transcrição. O servidor não conseguiu iniciar a transcrição."]
              break;
            case 'RUNNING':
              returnJSON.requestData = transcripData;
              returnJSON.requestSucess = true;
              break;
            default:
              returnJSON.accessmessage = [...returnJSON.accessmessage, 
                "Falha na solicitação da transcrição. Erro não mapeado."]
          }
        }
      } catch(err:any){
        console.log("ERROR from requestTrancript() in TranscriptController: ", err.stack.split("at")[0]);
        next(err);
      } finally{
        return res.status(200).json(returnJSON);
      }
    }
  }
  // ------------------------------------------------------------------------
  async tokenTrancript(req: Request, res: Response, next: NextFunction) {
    var returnJSON = new ResponseJSON;
    var id = req.body.fileId as string;
    var pwToDataBase:boolean = (dencriptString(req.body.pass,id) ===
                                (process.env.TOKEN_TRANSCRIPT as string));
    returnJSON.databaseIsUp();
    try {
      await StoreLogAccess(id,req,pwToDataBase);
      if (pwToDataBase)
        await returnJSON.processAccessToken(GenerateToken(id),48);
    }catch(err:any){
      console.log("ERROR from tokenTrancript() in TranscriptController: ", err.stack.split("at")[0]);
      next(err);
    }finally{
      return res.status(200).json(returnJSON);
    }
  }
  // ------------------------------------------------------------------------
  async acceptTrancript(req: Request, res: Response, next: NextFunction) {
    var returnJSON = new ResponseJSON;
    try{
      await returnJSON.processAccessToken(<string>req.body.tokennum);
      var transcript_id:string = req.body.transcript_id as string;
        if ((!returnJSON.tokenInfo.validy) || 
            (transcript_id === '-1')){
          returnJSON.accessmessage = ["Chave de acesso bloqueada ou inválida."];
        } else {
          returnJSON.requestSucess = true;
          console.log("Transcrição id ",transcript_id," aceita")
          var trancriptData:pgInterfaceTranscriptFile = {
            id:Number(transcript_id),
            hash_md5: FitData(req.body.hash_md5),
            status: FitData(req.body.status),
          }
          await finishTrancriptProcess(trancriptData);
          await StoreLogAccess("-1",req,false);
          // return res.status(200).json(returnJSON);
        }   
    }catch(err:any){
      console.log("ERROR from acceptTrancript() in TranscriptController: ", err.stack.split("at")[0]);
      next(err);
    }finally{
      return res.status(200).json(returnJSON);
    }
  }
  // ------------------------------------------------------------------------
  async getTranscriptData(req: Request, res: Response) {
    var returnJSON = new ResponseJSON;
    returnJSON.databaseIsUp();
    try {
      await returnJSON.processAccessToken(<string>req.body.tokennum);
      var id:string = returnJSON.tokenInfo.id.toString();
      if ((!returnJSON.tokenInfo.validy) || 
          (id === '-1')){
        returnJSON.accessmessage = ["Chave de acesso bloqueada ou inválida."];
        await StoreLogAccess(returnJSON.tokenInfo.id.toString(),req,false);
        return res.status(200).json(returnJSON);
      }
      var transcriptData: pgInterfaceAudioFileTranscript[] = await getAudioForTrancript(id);
      await StoreLogAccess(id,req,returnJSON.autenticate);
      returnJSON.requestData = transcriptData;
      returnJSON.requestSucess = returnJSON.tokenInfo.validy;
    }catch(err:any){
      console.log("ERROR from getTranscriptData() in TranscriptController: ", err.stack.split("at")[0]);
    } finally{
      return res.status(200).json(returnJSON);;
    }
  }
  // ------------------------------------------------------------------------
  async getTranscriptFile(req: Request, res: Response) {
    var returnJSON = new ResponseJSON;
    var fileID: Number = Number(req.query.FileId);
    returnJSON.databaseIsUp();
    if ((req.query.FileId === undefined) || (Number.isNaN(fileID))){
      returnJSON.accessmessage = ["Identificador do arquivo não enviado."];
      res.status(200).json(returnJSON);
      return 
    }
    else{
      try {
        await returnJSON.processAccessToken(<string>req.query.tokennum);
        var id:string = returnJSON.tokenInfo.id.toString();
        if ((!returnJSON.tokenInfo.validy) || 
            (id === '-1')){
          returnJSON.accessmessage = ["Chave de acesso bloqueada ou inválida."];
          await StoreLogAccess(returnJSON.tokenInfo.id.toString(),req,false);
          return res.status(200).json(returnJSON);
        }
        var transcriptData: pgInterfaceTranscriptFile = await GetTranscripFileByAudioID(fileID.toString(),id);
        await StoreLogAccess(id,req,returnJSON.autenticate);
        if ((returnJSON.tokenInfo.validy) && (Number(transcriptData.id) > 0)){
          // console.log("1:",transcriptData.file_full_path)
          let fileName = path.parse(transcriptData.file_full_path as string).base.slice(33);
          // console.log("2:",path.parse(transcriptData.file_full_path as string).base)
          // console.log("3:",fileName)
          const filePath = transcriptData.file_full_path as string;
          const options = {
                  headers: { 
                    'x-timestamp': Date.now(),
                    'x-sent': true,
                    'Content-disposition': "attachment; filename=" + `${transcriptData.file_full_path}`, // gets ignored
                    'Content-type': `text/${path.parse(fileName).ext}`,
                  }
                }
          res.setHeader('filename',fileName)
                    // TODO: registrar no banco de dados
          res.download(
                filePath,
                fileName,
                options
              );
          returnJSON.requestSucess = true;
          console.log("File sent successfully:", transcriptData.file_full_path);
        }else
          returnJSON.accessmessage = [...returnJSON.accessmessage, "Arquivo de transcrição não disponível para o usuário"];

      }catch(err:any){
        console.log("ERROR from getTranscriptData() in TranscriptController: ", err.stack.split("at")[0]);
      } finally{
        return;
      }
    }
  }
  // ------------------------------------------------------------------------
  async removeTranscript(req: Request, res: Response, next: NextFunction) {
    var returnJSON = new ResponseJSON;
    var fileID: Number = Number(req.query.FileId);
    returnJSON.databaseIsUp();
    if ((req.query.FileId === undefined) || (Number.isNaN(fileID))){
      returnJSON.accessmessage = ["Identificador do arquivo não enviado."];
      return res.status(200).json(returnJSON);
    }
    else{
      try {
        await returnJSON.processAccessToken(<string>req.query.tokennum);
        var id:string = returnJSON.tokenInfo.id.toString();
        if ((!returnJSON.tokenInfo.validy) || 
            (id === '-1')){
          returnJSON.accessmessage = ["Chave de acesso bloqueada ou inválida."];
          await StoreLogAccess(returnJSON.tokenInfo.id.toString(),req,false);
          return res.status(200).json(returnJSON);
        }
        var transcriptData:pgInterfaceTranscriptFile = await DeactivateTranscriptFile(fileID.toString(), id);
        if (transcriptData.id === -1)
          returnJSON.accessmessage = [...returnJSON.accessmessage, "Arquivo de transcrição disponível para o usuário"];
        returnJSON.requestSucess = transcriptData.id !== -1;
        await StoreLogAccess(id,req,returnJSON.autenticate);
      } catch(err:any){
          console.log("ERROR from removeTranscript() in TranscriptController: ", err.stack.split("at")[0]);
          next(err);
      } finally{
        return res.status(200).json(returnJSON);
      }
    }
  }
  // ------------------------------------------------------------------------
}
export default new TranscriptController();
