import { Pool } from "pg";
import { pgInterfaceDownloadFile } from "../Models/User";
import { connectionStringWebUser } from "./General";

// ----------------------------------------------------------------------------
async function AddDownloadFile(fileData:pgInterfaceDownloadFile):Promise<pgInterfaceDownloadFile>{
    var returnValue:pgInterfaceDownloadFile = {};
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var queryString: string;
    try {
        queryString = "INSERT INTO download_file (access_keys_id,hash_md5,file_full_path,audio_ids) VALUES ($1,$2,$3,$4) RETURNING *;";
        const res = await pool.query(queryString, [fileData.access_keys_id,fileData.hash_md5,fileData.file_full_path, fileData.audio_ids]);
        pool.end();
        returnValue = res.rows[0];
    } catch (e) {
        console.log("ERROR from AddDownloadFile() in DownloadTable: ",e); // 30
        throw e
    } finally {
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
export {
    AddDownloadFile
}