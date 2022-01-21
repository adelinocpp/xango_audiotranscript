// ----------------------------------------------------------------------------
interface pgInterfaceUser {
  // --- Controle basico de acesso de usuario
  id: number
  user_name?: string
  email?: string 
  access_key?: string,
  active_record?: boolean,
  created?: Date
  updated?: Date
  completed?: Date
};
// ----------------------------------------------------------------------------
interface pgInterfaceAudioFile{
  id?: number,
  access_keys_id?: number,
  audio_metadata?: JSON,
  hash_md5?: string,
  file_full_path?: string,
  audio_tags?: string[],
  active_record?: boolean,
  created?: Date,
  updated?: Date,
  completed?: Date
}
// ----------------------------------------------------------------------------
interface pgInterfaceDownloadFile{
  id?: number,
  access_keys_id?: number,
  hash_md5?: string,
  file_full_path?: string,
  audio_ids?: string,
  active_record?: boolean,
  created?: Date,
  updated?: Date,
  completed?: Date
}
// ----------------------------------------------------------------------------
interface pgInterfaceTranscriptFile{
  id?: number,
  access_keys_id?: number,
  audio_file_id?: number,
  hash_md5?: string,
  file_full_path?: string,
  active_record?: boolean,
  status?: string,
  requested?: Date,
  created?: Date,
  updated?: Date,
  completed?: Date
}
// ----------------------------------------------------------------------------
interface pgInterfaceAudioFileTranscript{
  audio_id?: number,
  access_keys_id?: number,
  audio_metadata?: JSON,
  audio_hash_md5?: string,
  audio_file_full_path?: string,
  audio_tags?: string[],
  created?: Date,
  trancript_hash_md5?: string,
  transcript_file_full_path?: string,
  transcript_status?: string,
  requested?: Date,
  updated?: Date,
  completed?: Date
}
// ----------------------------------------------------------------------------
interface itfFullFilePath{
  fullFilePath?:string;
  filePath?:string;
  fileName?:string;
  hashMD5?:string;
}
// ----------------------------------------------------------------------------
interface interfaceCaptcha {
  img_file_name?: string
  img_data?: string
};
// ----------------------------------------------------------------------------
interface tokenInfoInterface {
  id: number
  iat?: string
  exp?: string
  validy?: boolean
}
// ----------------------------------------------------------------------------
interface tokenReturnInterface {
  accessToken: string
  exp: Date
}
// ------------------------------------------------------------------------
interface prefix {
  key: string;
  value: string;
}
// ----------------------------------------------------------------------------
interface itfTableDataAcess {
  user_id: number,
  table_name?: string,
  can_access?: boolean,
  can_select_all?: boolean,
  can_select_yours?: boolean,
  can_insert?: boolean,
  can_edit?: boolean,
  can_edit_yours?: boolean,
  can_decript?:boolean,
  view_deactivate?: boolean,
  id_key?: string
}
// ----------------------------------------------------------------------------
interface itfMulterData{
  destination: string,
  filename: string
}
// ----------------------------------------------------------------------------
export {pgInterfaceUser, 
        pgInterfaceAudioFile, 
        pgInterfaceDownloadFile, 
        pgInterfaceTranscriptFile,
        pgInterfaceAudioFileTranscript,
        itfFullFilePath,
        interfaceCaptcha,
        tokenInfoInterface,
        tokenReturnInterface,
        prefix,
        itfTableDataAcess,
        itfMulterData
    }
// ----------------------------------------------------------------------------