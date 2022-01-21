import { Pool } from "pg";
import { itfFullFilePath, pgInterfaceAudioFile, pgInterfaceAudioFileTranscript, pgInterfaceTranscriptFile } from "../Models/User";
import { connectionStringWebUser } from "./General";
import { GetAccessKeyById } from "./UserTable";
import crypto  from "crypto";
import path from "path";
import child from "child_process";
import util from "util";
import { FitData, getMD5Hash, sleep } from "../Cryptography/Authentication";
import fs from "fs";
import { GetAudioFileByID } from "./AudioFileTable";

// ----------------------------------------------------------------------------
async function startTranscript(audio_id:string, user_id:string):Promise<pgInterfaceTranscriptFile>{
  var returnValue:pgInterfaceTranscriptFile = {id: -1, status: "FAILED_ACCESS"};
  const pool = new Pool({ connectionString: connectionStringWebUser });
  var queryString: string;
  try {
    var audioData: pgInterfaceAudioFile = await GetAudioFileByID(audio_id,user_id);
    if (audioData.id !== -1){
      let audioBaseName = path.parse(audioData.file_full_path as string).name.slice(33);
      // console.log("audioBaseName 1:",audioBaseName)
      audioBaseName = crypto.randomBytes(16).toString('hex') + "_" + audioBaseName + '.txt';
      // console.log("audioBaseName 2:",audioBaseName)
      let file_full_path: string = path.resolve(__dirname, process.env.TRANSCRIPT_FILES_FOLDER as string) + '/' + audioBaseName;
      queryString = `INSERT INTO transcript_file (access_keys_id,audio_file_id,file_full_path,requested) VALUES ($1,$2,$3,to_timestamp(${Date.now()} / 1000.0)) RETURNING *;`;
      const res = await pool.query(queryString, [user_id,audio_id,file_full_path]);
      pool.end();
      returnValue = res.rows[0];
      // console.log("Transcript:",returnValue)
      if (!runTrancriptProcess(returnValue,audioData.file_full_path as string)){
        returnValue.hash_md5 = "";
        returnValue.status = "FAILED_RUN";
        await finishTrancriptProcess(returnValue);
      }
    }
  } catch (e) {
      console.log("ERROR from startTranscript() in TranscriptTable: ",e); // 30
      throw e
  } finally {
      return returnValue;
  }
}
// ----------------------------------------------------------------------------
function runTrancriptProcess(transcriptData: pgInterfaceTranscriptFile, audioFile:string):boolean{
  var returnValue:boolean = false;
  var trancribePath = path.resolve(__dirname, process.env.TRANSCRIPT_APP as string);
  let commandString: string = `python3 ${trancribePath}/audio_transcribe.py ${audioFile} ${transcriptData.id} ${transcriptData.file_full_path} ${transcriptData.access_keys_id}`;
  try {
    console.log("DEBUG:  Transcrição Solicitada....")
    console.log("commandString:",commandString)
    child.exec(commandString);
    returnValue = true;
  } catch (e:any){
    console.log("ERROR from runTrancriptProcess() in TranscriptTable: ",e); // 30
    throw e;
  } finally{
    return returnValue;
  }
}
// ----------------------------------------------------------------------------
async function finishTrancriptProcess(transcriptData: pgInterfaceTranscriptFile):Promise<boolean>{
  var returnValue:boolean = false;
  const pool = new Pool({ connectionString: connectionStringWebUser });
  var queryString: string;
  try {
    queryString = `UPDATE transcript_file SET hash_md5 = $2, status = $3, completed = to_timestamp(${Date.now()} / 1000.0) WHERE id = $1;`
    const res = await pool.query(queryString, [transcriptData.id,transcriptData.hash_md5,transcriptData.status]);
    pool.end();
    returnValue = (res.rowCount > 0);
    console.log("Transcriçaõ finalizada status:",transcriptData.status)
  } catch (e) {
      console.log("ERROR from finishTrancriptProcess() in TranscriptTable: ",e); // 30
      throw e
  } finally {
      return returnValue;
  }
}
// ----------------------------------------------------------------------------
async function getAudioForTrancript(user_id:string):Promise<pgInterfaceAudioFileTranscript[]>{
  var returnValue:pgInterfaceAudioFileTranscript[] = []
  const pool = new Pool({ connectionString: connectionStringWebUser });
  var queryString: string;
  try {
    queryString = `SELECT * FROM  audio_file WHERE (access_keys_id = $1) AND (active_record = TRUE);`
    let res_audio = await pool.query(queryString, [user_id]);
    queryString = `SELECT * FROM  transcript_file WHERE (access_keys_id = $1) AND (active_record = TRUE);`
    let res_transcript = await pool.query(queryString, [user_id]);
    // returnValue = res.rows;
    for(let i = 0; i < res_audio.rowCount; i++){
      let tempData:pgInterfaceAudioFileTranscript = {
        audio_id: res_audio.rows[i].id,
        access_keys_id: res_audio.rows[i].access_keys_id,
        audio_metadata: res_audio.rows[i].audio_metadata,
        audio_hash_md5: res_audio.rows[i].hash_md5,
        audio_file_full_path: path.parse(res_audio.rows[i].file_full_path).base.slice(33),
        audio_tags: res_audio.rows[i].audio_tags,
        created: res_audio.rows[i].created,
        trancript_hash_md5: "",
        transcript_file_full_path: "",
        transcript_status: "NOT_REQUEST"
      };
      // console.log("res_transcript",res_transcript)
      for(let j = 0; j < res_transcript.rowCount; j++){
        if ((res_audio.rows[i].id === res_transcript.rows[j].audio_file_id)
            && ( res_transcript.rows[j].active_record)){
              // console.log("Transcript match")
          tempData.trancript_hash_md5 = res_transcript.rows[j].hash_md5;
          tempData.transcript_file_full_path = path.parse(res_transcript.rows[j].file_full_path).base.slice(33),
          tempData.transcript_status = res_transcript.rows[j].status;
          tempData.requested = res_transcript.rows[j].requested
          tempData.updated = res_transcript.rows[j].updated
          tempData.completed = res_transcript.rows[j].completed
        }
      }
      returnValue = [...returnValue, tempData]
    }
    pool.end();
  } catch (e) {
    console.log("ERROR from getAudioForTrancript() in TranscriptTable: ",e); // 30
    throw e
  } finally {
    return returnValue;
  }
}
// ------------------------------------------------------------------------
async function GetTranscripFileByAudioID(audio_id:string, user_id:string):Promise<pgInterfaceTranscriptFile>{
  var returnValue:pgInterfaceTranscriptFile = {id: -1};
  const pool = new Pool({ connectionString: connectionStringWebUser });
  try {
    var queryString: string = "SELECT * FROM transcript_file WHERE ((audio_file_id = $1) AND (active_record = TRUE) AND (access_keys_id = $2));";
    const res = await pool.query(queryString, [audio_id,user_id]);
    if (res.rowCount > 0)
      returnValue = res.rows[0];
    pool.end();
  } catch(e) {
    console.log("ERROR from GetTranscripFileByAudioID() in TranscriptTable: ", e); // 30
  } finally{
    return returnValue;
  }
}
// ------------------------------------------------------------------------
async function DeactivateTranscriptFile(audio_id:string, user_id:string):Promise<pgInterfaceTranscriptFile>{
  var returnValue:pgInterfaceTranscriptFile = {id: -1};
  const pool = new Pool({ connectionString: connectionStringWebUser });
  try {
    var queryString: string = "UPDATE transcript_file SET active_record = FALSE WHERE ((audio_file_id = $1) AND (access_keys_id = $2)) RETURNING *;";
    const res = await pool.query(queryString, [audio_id, user_id]);
    returnValue = res.rows[0];
    pool.end();
  } catch(e) {
    console.log("ERROR from DeactivateTranscriptFile() in TranscriptTable: ", e); // 30
  } finally{
    return returnValue;
  }
}
// ------------------------------------------------------------------------
export {
        startTranscript,
        finishTrancriptProcess,
        getAudioForTrancript,
        GetTranscripFileByAudioID,
        DeactivateTranscriptFile}