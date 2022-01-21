import { Pool } from "pg";
import { itfFullFilePath, pgInterfaceAudioFile } from "../Models/User";
import { connectionStringWebUser } from "./General";
import { GetAccessKeyById } from "./UserTable";
import crypto  from "crypto";
import path from "path";
import child from "child_process";
import util from "util";
import { FitData, getMD5Hash, sleep } from "../Cryptography/Authentication";
import fs from "fs";

// ----------------------------------------------------------------------------
async function AddAudioFile(audioData:pgInterfaceAudioFile):Promise<pgInterfaceAudioFile>{
    var returnValue:pgInterfaceAudioFile = {};
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var queryString: string;
    var insertData: any[];
    try {
        // console.log("audioData",audioData.audio_tags)
        if (audioData.audio_tags === undefined){
            queryString = "INSERT INTO audio_file (audio_metadata,access_keys_id,file_full_path,hash_md5) VALUES ($1,$2,$3,$4) RETURNING *;";
            insertData = [audioData.audio_metadata,audioData.access_keys_id,audioData.file_full_path,audioData.hash_md5];
        }
        else{
            queryString = "INSERT INTO audio_file (audio_metadata,access_keys_id,file_full_path,hash_md5,audio_tags) VALUES ($1,$2,$3,$4,$5) RETURNING *;";
            insertData = [audioData.audio_metadata,audioData.access_keys_id,audioData.file_full_path,audioData.hash_md5, audioData.audio_tags]
        }
        const res = await pool.query(queryString, insertData);
        pool.end();
        returnValue = res.rows[0];
    } catch (e) {
        console.log("ERROR from AddAudioFile() in AudioFileTable: ",e); // 30
        throw e
    } finally {
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
async function DeactivateAudioFile(audio_id: string, user_id:string):Promise<pgInterfaceAudioFile>{
  var returnValue: pgInterfaceAudioFile = {id: -1};
  const pool = new Pool({ connectionString: connectionStringWebUser });
  try {
      var queryString: string = "UPDATE audio_file SET active_record = FALSE WHERE ((id = $1) AND (access_keys_id = $2))   RETURNING *;";
      const res = await pool.query(queryString, [audio_id, user_id]);
      returnValue = res.rows[0];
      pool.end();
  } catch(e) {
      console.log("ERROR from DeactivateAudioFile() in AudioFileTable: ", e); // 30
  } finally{
      return returnValue;
  }
}
// ----------------------------------------------------------------------------
async function CheckAudioFileExist(md5hash: string):Promise<boolean>{
    var returnValue:boolean = false; 
    const pool = new Pool({ connectionString: connectionStringWebUser });
    try {
        var queryString: string = "SELECT * FROM audio_file WHERE (hash_md5 = $1) AND (active_record = TRUE);";
        const res = await pool.query(queryString, [md5hash]);
        for(let i = 0; i < res.rowCount; i++){
            if(res.rows[i].active_record)
                returnValue = true;
            else {
                // RemoveAudioFileById(res.rows[i].id);
            }
        }
        pool.end();
    } catch(e) {
        console.log("ERROR from CheckAudioFileExist() in AudioFileTable: ", e); // 30
    } finally{
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
async function GetAudioFileByID(audio_id: string, user_id:string):Promise<pgInterfaceAudioFile>{
  var returnValue:pgInterfaceAudioFile = {id: -1};
  const pool = new Pool({ connectionString: connectionStringWebUser });
  try {
      var queryString: string = "SELECT * FROM audio_file WHERE ((id = $1) AND (active_record = TRUE) AND ((access_keys_id = $2) OR (is_public = TRUE)) );";
      const res = await pool.query(queryString, [audio_id,user_id]);
      if (res.rowCount > 0)
        returnValue = res.rows[0];
      pool.end();
  } catch(e) {
      console.log("ERROR from GetAudioFileByID() in AudioFileTable: ", e); // 30
  } finally{
      return returnValue;
  }
}
// ----------------------------------------------------------------------------
/** zip comand example
 * zip -j -q 9 -P '@WSX1qaz' test.zip ./Audios_8kHz/Locutor_0001.wav ./Audios_8kHz/Locutor_0002.wav ./Audios_8kHz/Locutor_0003.wav ./Audios_8kHz/Locutor_0004.wav ./Audios_8kHz/Locutor_0005.wav
 * 
 */
async function GenerateFileToDownload(user_id:string,files_ids:string):Promise<itfFullFilePath>{
    var returnValue:itfFullFilePath = {}; 
    const pool = new Pool({ connectionString: connectionStringWebUser });
    try {
      var keyEncript = await GetAccessKeyById(user_id);
      files_ids = FitData(files_ids);
      var queryString: string = `SELECT * FROM audio_file WHERE id IN ${files_ids}`;
      const res = await pool.query(queryString);
      if (res.rowCount < 1)
          return returnValue;
      let strFileNames: string = "";
      for(let i = 0; i < res.rowCount; i++)
          strFileNames += res.rows[i].file_full_path + " "
      strFileNames = strFileNames.slice(0,strFileNames.length-1);
      // --- geração do zip file
      let today = new Date()
      var zipFile:string = user_id + "_" + today.toISOString().replace(/[-.:TZ\s]/g, '') + "_" 
                      + crypto.randomBytes(8).toString('hex') + ".zip";
      returnValue.filePath = path.resolve(__dirname,process.env.AUDIO_FILES_FOLDER as string);
      returnValue.fileName = zipFile;
      returnValue.fullFilePath = returnValue.filePath + "/" + zipFile;
      var strConsoleCommand:string = `zip -j -q -9 -P '${keyEncript}' ${returnValue.fullFilePath} ${strFileNames}`;    
      var out = child.execSync(strConsoleCommand)
      // const exec_command = util.promisify(child.exec);
      // await exec_command(strConsoleCommand);
      returnValue.hashMD5 = await getMD5Hash(returnValue.fullFilePath);
      pool.end();
    } catch(e) {
        console.log("ERROR from GenerateFileToDownload() in AudioFileTable: ", e); // 30
    } finally{
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
async function removeDownloadFile(id:number|undefined):Promise<boolean>{
  var returnValue:boolean = false; 
  if (id == undefined)
      returnValue;
  const pool = new Pool({ connectionString: connectionStringWebUser });
  var queryString:string = "SELECT * FROM download_file WHERE (id != $1 AND on_download = TRUE);"
  try {
      var res = await pool.query(queryString, [id]);
      queryString = "UPDATE download_file SET on_download = FALSE WHERE id=$1;"
      for (let i = 0; i < res.rowCount; i++){
          if (fs.existsSync(res.rows[i].file_full_path)){
              await pool.query(queryString, [res.rows[i].id]);
              fs.unlinkSync(res.rows[i].file_full_path);
          }
      }
      pool.end();
  } catch(e) {
      console.log("ERROR from removeDownloadFile() in AudioFileTable: ", e); // 30
  } finally{
      return returnValue;
  }
};
// ----------------------------------------------------------------------------
export {
        AddAudioFile,
        CheckAudioFileExist,
        GetAudioFileByID,
        DeactivateAudioFile,
        GenerateFileToDownload,
        removeDownloadFile
        }