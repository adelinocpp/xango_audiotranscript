require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import {
    getMediaInfoData,
    getMD5Hash,
		ExtractFileName} from "../Cryptography/Authentication";
import {StoreLogAccess} from "../Database/LogAccessTable";
import ResponseJSON from "../Models/ResponseJSON";
import { pgInterfaceAudioFile, pgInterfaceDownloadFile } from "../Models/User";
import { AddAudioFile, CheckAudioFileExist, DeactivateAudioFile, GetAudioFileByID } from "../Database/AudioFileTable";
import path from "path";
// ============================================================================
// --- Interfce de Usuário do sistema com o FORNTEND --------------------------
//  TODO: escrever a descricao destas funcoes
//
//  GetProfileById: Recebe as credenciais de login e devolve um token (de acesso)
//
//  SetProfileById: acessa o sistema com um token (de acesso) válido
//
//  SetAvatar: Cadastra um usuário e retorna um token (de acesso) válido
//  
//  
//
// ============================================================================


class AudioFilesController {
  // ------------------------------------------------------------------------
  async collectAudioFiles(req: Request, res: Response) {
  var returnJSON = new ResponseJSON;
  if (!req.query.tokennum)
    return res.status(200).json(returnJSON);
  await returnJSON.processAccessToken(<string>req.query.tokennum);
  var hasFile:boolean = (req.file !== undefined);
  if (!hasFile){
    returnJSON.accessmessage = ['Arquivo não enviado.']
    return res.status(200).json(returnJSON);
  }
  var audioFullPath:string = req.file!.destination + "/" + req.file!.filename
  if (returnJSON.autenticate) {
    var returnRequestData: pgInterfaceAudioFile = {};
    try{
      var md5hash = await getMD5Hash(audioFullPath);
      var result:string = await getMediaInfoData(audioFullPath,req.file!.destination);
      var audioExist = await CheckAudioFileExist(md5hash);
      returnJSON.databaseIsUp();
      let gotTags = (req.body.audio_tags === undefined)? undefined:req.body.audio_tags as string[];
      if (!audioExist){
          var AudioFileData: pgInterfaceAudioFile = {
              hash_md5: md5hash,
              audio_metadata: JSON.parse(result),
              access_keys_id: Number(returnJSON.tokenInfo.id), 
              file_full_path: audioFullPath,
              audio_tags: gotTags
          };
          returnRequestData = await AddAudioFile(AudioFileData);
          returnRequestData.file_full_path = "";
          returnJSON.accessmessage = [`Arquivo ${req.file!.filename.slice(33)} cadastrado com sucesso.`];
          returnJSON.requestSucess = true;
      } else {
          if (fs.existsSync(audioFullPath))
              fs.unlinkSync(audioFullPath); 
          returnJSON.accessmessage = [`Arquivo ${req.file!.filename.slice(33)} já existe no banco de dados.`];
      }
      returnJSON.requestData = returnRequestData;
      await StoreLogAccess(returnJSON.tokenInfo.id.toString(),req,!audioExist);
      } catch (err:any){
          console.log("ERROR from GetAudioFiles() on class AudioFilesController: ", err.stack.split("at")[0]); // 30
          returnJSON.accessmessage = ["Falha ao enviar arquivo para o servidor. Problemas no acesso ao banco de dados ou no processo de LOG."];
      }finally {
          return res.status(200).json(returnJSON);
      }
  }
  else{
      if (returnJSON.tokenInfo.id < 0)
          returnJSON.accessmessage = ["Falha na verificação do token (e-mail). Usuário não consta na base de dados."];
      else
          returnJSON.accessmessage = ["Falha na verificação do token (e-mail)"];
  }
  return res.status(200).json(returnJSON);
  }
  // --------------------------------------------------------------------
  async getAudioFile(req: Request, res: Response, next: NextFunction) {
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
        var AudioFileData: pgInterfaceAudioFile = {id: -1};
        AudioFileData = await GetAudioFileByID(fileID.toString(), id,);
        await StoreLogAccess(id,req,returnJSON.autenticate);
        if ((returnJSON.tokenInfo.validy) && (Number(AudioFileData.id) > 0)){
          let fileName = ExtractFileName(AudioFileData.file_full_path as string).slice(33);
          const filePath = AudioFileData.file_full_path as string;
          const options = {
                  headers: { 
                    'x-timestamp': Date.now(),
                    'x-sent': true,
                    'Content-disposition': "attachment; filename=" + `${AudioFileData.file_full_path}`, // gets ignored
                    'Content-type': `audio/${path.parse(fileName).ext}`,
                  }
                }
          res.setHeader('filename',fileName)
          let opStream = fs.createReadStream(filePath);
          // TODO: registrar no banco de dados
          res.download(
                filePath,
                fileName,
                options
              );
          returnJSON.requestSucess = true;
          console.log("File sent successfully:", AudioFileData.file_full_path);
          opStream.pipe(res);
        }
        else
          returnJSON.accessmessage = [...returnJSON.accessmessage, "Arquivo de áudio não disponível para o usuário"];
      } catch(err:any){
          console.log("ERROR from GetAudioFile() in AudioFilesController: ", err.stack.split("at")[0]);
          console.error("File could not be sent!");
          next(err);
      } finally{
          return;
      }
    }
  }
  // --------------------------------------------------------------------
  async removeAudioFile(req: Request, res: Response, next: NextFunction) {
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
        var AudioFileData:pgInterfaceAudioFile = await DeactivateAudioFile(fileID.toString(), id);
        if (AudioFileData.id === -1)
          returnJSON.accessmessage = [...returnJSON.accessmessage, "Arquivo de áudio não disponível para o usuário"];
        returnJSON.requestSucess = AudioFileData.id !== -1;
        await StoreLogAccess(id,req,returnJSON.autenticate);
      } catch(err:any){
          console.log("ERROR from removeAudioFile() in AudioFilesController: ", err.stack.split("at")[0]);
          next(err);
      } finally{
        return res.status(200).json(returnJSON);
      }
    }
  }
}
export default new AudioFilesController();

// ------------------------------------------------------------------------