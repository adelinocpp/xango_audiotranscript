//require("dotenv").config();
import { Pool } from "pg";
import {pgInterfaceUser} from "../Models/User";
import {EncriptString, DencriptString} from "../Cryptography/CryptoString";
import {connectionStringWebUser}  from "./General";
import {tokenInfoInterface, CheckToken, EncriptPassWord} from "../Cryptography/Authentication";
import {pgInterfaceExtraEmail} from "../Models/ExtraEmail";
import fs from "fs";
// ----------------------------------------------------------------------------

// ============================================================================
// --- Operações com a tabela de Usuário do sistema ---------------------------
//
//  CheckUserOnDataBase: Checar se o usuário existe na tabela
//
//  GetUserID: Obter o ID do abministrador na tabela
//
//  GetUserEmailById: Obter o email do usuário pelo ID
//
//  CheckUserPW: Verificar se a senha do usuário é autentica
//  
//  AddUserOnDatabase: Adicionar usuário na tabela
//  
//  RemUserOfDataBase: Remove usuário da base de dados e todos registros associados
//
//  VerifyUser: Torna o usuário verificado
//
//  UnverifyUser: Remove a verificação do usuário
//
//  CheckUserVerify: Checa se o usuário é verificado
//
//  UpdatePasswordById: Autualiza a senha do usuário pela ID
//
//  SetUserNeedPasswordUpdate: Indica que usuário foi bloqueado e precisa atualizar senha
//
// ============================================================================

// ----------------------------------------------------------------------------
async function CheckUserOnDataBase(FieldValue:string):Promise<string>{
    // DONE: função enxuta versão 0.0.0
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var resultID = "-1";
    try {
        var result = await pool.query("SELECT * FROM access_keys WHERE (access_key = $1 AND active_record = TRUE)",[FieldValue]);
        for(let i = 0; i < result.rowCount ; i++)
            resultID = result.rows[i].id;
        pool.end();
    } catch(e) {
        console.log("ERROR from CheckUserOnDataBase() in UserTable: ", e); // 30
    } finally {
        return resultID;
    } 
};
// ----------------------------------------------------------------------------
async function CheckEmailOnDataBase(FieldValue:string):Promise<string>{
    // DONE: função enxuta versão 0.0.0
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var resultID = "-1";
    try {
        var result = await pool.query("SELECT * FROM access_keys WHERE (email = $1 AND active_record = TRUE)",[FieldValue]);
        for(let i = 0; i < result.rowCount ; i++)
            resultID = result.rows[i].id;
        pool.end();
    } catch(e) {
        console.log("ERROR from CheckUserOnDataBase() in UserTable: ", e); // 30
    } finally {
        return resultID;
    } 
};
// ----------------------------------------------------------------------------
async function GetUserById(id:string):Promise<pgInterfaceUser>{
    // DONE: função enxuta versão 0.0.0
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var userReturn: pgInterfaceUser = {
        id: -1, 
        }
    try {
        var queryString: string = "SELECT * FROM users WHERE id = $1"
        let result = await pool.query(queryString, [id]);
        pool.end();
        if (result.rowCount > 0)
        {
            userReturn.id       = Number(id);
            userReturn.user_name = result.rows[0].user_name;
            userReturn.email    = result.rows[0].email;
            userReturn.created  = result.rows[0].created;
            userReturn.updated  = result.rows[0].updated;
            userReturn.completed    = result.rows[0].completed;
            
            return userReturn;
        }
        else
            return userReturn;
    } catch(e) {
        console.log("ERROR from GetUserDataById() in UserTable: ",e); // 30
        return userReturn;
    }    
};
// ----------------------------------------------------------------------------
async function GetUserID(FieldValue:string):Promise<string>{
    // DONE: função enxuta versão 0.0.0
    var returnValue:string = "-1";
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var numerId:string = "";
    try {
        var queryString: string = "SELECT * FROM users"
        let result = await pool.query(queryString);
        pool.end();
        for(let i = 0; i < result.rowCount ; i++){
            let tableRow = result.rows[i];
            let tempId = tableRow.id;
            let username = DencriptString(<string>tableRow.username,tempId);
            let email = DencriptString(<string>tableRow.email,tempId);
            if ((username.toString().trim() === FieldValue) || (email.toString().trim() === FieldValue)) {
                returnValue = tempId;
                break;
            }
        }
    } catch(e) {
        console.log("ERROR from GetUserID() in UserTable: ", e.stack.split("at")[0]);
    } finally{
        return returnValue;
    }
};
// ----------------------------------------------------------------------------
async function GetUserEmailById(id: string):Promise<string>{
    // DONE: função enxuta versão 0.0.0
    const pool = new Pool({ connectionString: connectionStringWebUser });
    try {
        var queryString: string = "SELECT * FROM users WHERE id = $1"
        let result = await pool.query(queryString, [id]);
        pool.end();
        // console.log("result.rows[0]",result.rows[0])
        if (result.rowCount > 0)
            return DencriptString(<string>result.rows[0].email,id);
        else
            return "";
    } catch(e) {
        console.log("ERROR from GetUserEmailById() in UserTable: ",e);
        return "";
    }    
}
// ----------------------------------------------------------------------------
async function GetUserUserNameById(id: string):Promise<string>{
    // DONE: função enxuta versão 0.0.0
    const pool = new Pool({ connectionString: connectionStringWebUser });
    try {
        var queryString: string = "SELECT * FROM users WHERE id = $1"
        let result = await pool.query(queryString, [id]);
        pool.end();
        if (result.rowCount > 0)
            return DencriptString(<string>result.rows[0].username,id);
        else
            return "Conta de usuário encerrada.";
    } catch(e) {
        console.log("ERROR from GetUserUserNameById() in UserTable: ",e);
        return "";
    }    
}
// ----------------------------------------------------------------------------
async function CheckUserPW(id: string, FieldValue:string):Promise<boolean>{
    // DONE: função enxuta versão 0.0.0
    const pool = new Pool({ connectionString: connectionStringWebUser });
    try {
        var queryString: string = "SELECT * FROM users WHERE id = $1"
        let result = await pool.query(queryString, [id]);
        pool.end();
        //console.log("PW:",result.rows[0].userpw.toString().trim());
        return (result.rows[0].userpw.toString().trim() === FieldValue);
    } catch(e) {
        console.log("ERROR from CheckUserPW() in UserTable: ",e);
        return false;
    }    
};
// ----------------------------------------------------------------------------
async function CheckUserNeedPwUpdate(id: string):Promise<boolean>{
    // DONE: função enxuta versão 0.0.0
    const pool = new Pool({ connectionString: connectionStringWebUser });
    try {
        var queryString: string = "SELECT * FROM users WHERE id = $1"
        let result = await pool.query(queryString, [id]);
        pool.end();
        return (result.rows[0].pwneedupdate);
    } catch(e) {
        console.log("ERROR from CheckUserNeedPwUpdate() in UserTable: ",e);
        return false;
    }    
};
// ----------------------------------------------------------------------------
async function EncriptUser(userId: string):Promise<boolean>{
    // DONE: função enxuta versão 0.0.0
    var QS: string = 'SELECT * FROM users WHERE id = $1';
    var returnValue: boolean = false;
    try{
        const pool = new Pool({ connectionString: connectionStringWebUser });
        let result = await pool.query(QS, [userId]);
        if (result.rowCount ==1){
            var encUserName = EncriptString(<string>result.rows[0].username,userId);
            var encEmail = EncriptString(<string>result.rows[0].email,userId);
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                var queryString: string = "UPDATE users SET username = $1, email = $2 WHERE id = $3;"
                const res = await client.query(queryString, [encUserName,encEmail,userId]);
                await client.query('COMMIT');
            } catch (e) {
                await client.query('ROLLBACK');
                console.log("ERROR atomic encript of EncriptUser() in UserTable: ",e); // 30
                throw e;
            } finally {
                client.release();
            }
            returnValue  = true;
        }
        pool.end();
    } catch(e) {
        console.log("ERROR from EncriptUser() in UserTable: ",e); // 30
    } finally{
        return returnValue;
    }   
}
// ----------------------------------------------------------------------------
async function CheckPasswordAreadyUpdated(token: string):Promise<boolean>{
    var tokenData: tokenInfoInterface = await CheckToken(token, false, true);
    const pool = new Pool({ connectionString: connectionStringWebUser });
    try {
        var queryString: string = "SELECT * FROM users WHERE id = $1"
        let result = await pool.query(queryString, [tokenData.id]);
        pool.end();
        return (result.rows[0].updated > new Date(Number(tokenData.iat) * 1000));
    } catch(e) {
        console.log("ERROR from CheckPasswordAreadyUpdated() in UserTable: ",e);
        return false;
    }    
}
// ----------------------------------------------------------------------------
async function AddUserOnDatabase(userData: pgInterfaceUser):Promise<string>{
    var returnValue: string = "-1";
    try {
        const pool = new Pool({ connectionString: connectionStringWebUser });
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            var queryString: string = "INSERT INTO users (username,email) VALUES ($1,$2)";
            client.query(queryString, [userData.user_name,userData.email]);
            await client.query('COMMIT');
            var queryString: string = "SELECT * FROM users WHERE username = $1";
            const res = await pool.query(queryString,[userData.user_name])
            var id = res.rows[0].id;
            // TODO: Generate Acess Key
            await EncriptUser(id);
            
            returnValue = id;

        } catch (e) {
            await client.query('ROLLBACK');
            console.log(e);
            throw e
        } finally {
            client.release();
        }
        pool.end();
        return returnValue;
    } catch(e) {
        console.log("ERROR from AddUserOnDatabase() in UserTable: ",e); // 30
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
async function RemUserFromDataBaseById(userID: string):Promise<boolean>{
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var resultBoolCheck = false;
    // var userTablesArray:string[] = ["extra_email", "user_avatar", "user_data", "users"];
    var queryString, avataFileName: string;
    var result: any;
    try {
        result = await pool.query("SELECT * FROM user_avatar WHERE user_id = $1",[userID]);
        if (result.rowCount > 0){
            avataFileName = DencriptString(result.rows[0].fileName,result.rows[0].id);
            if (fs.existsSync(avataFileName))
                fs.unlinkSync(avataFileName);
        }
        result = await pool.query("DELETE FROM user_avatar WHERE user_id = $1",[userID]);
        result = await pool.query("DELETE FROM extra_email WHERE user_id = $1",[userID]);
        result = await pool.query("DELETE FROM user_data WHERE user_id = $1",[userID]);
        result = await pool.query("UPDATE users SET active_record=FALSE WHERE id = $1",[userID]);
        pool.end();
        resultBoolCheck = true;
    } catch(err) {
        console.log("ERROR from RemUserFromDataBaseById() in UserTable: ", err); // .stack.split("at")[0]
    } finally {
        return resultBoolCheck;
    }
}
// ----------------------------------------------------------------------------
async function VerifyUser(id: string):Promise<boolean>{
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var returnValue:boolean = false;
    var queryString: string = `SELECT * FROM users WHERE id = $1`;
    var result;
    try {
        result = await pool.query(queryString, [id]);
        if (result.rows[0].verify !== true){
            queryString = `UPDATE users SET verify = true, completed = to_timestamp(${Date.now()} / 1000.0) WHERE id = $1 RETURNING verify`;
            result = await pool.query(queryString, [id]);
            returnValue = (result.rowCount === 1);
        }
        pool.end();
        return returnValue;
    } catch(e) {
        console.log("ERROR from VerifyUser() in UserTable: ",e); // 30
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
async function UnverifyUser(id: string):Promise<boolean>{
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var returnValue:boolean = false;
    try {
        var queryString: string = `UPDATE users SET verify = false WHERE id = $1 RETURNING verify`;
        //console.log("queryString: ",queryString);
        let result = await pool.query(queryString, [id]);
        //console.log("VerifyUser: result (query) = ",result);
        return (result.rowCount === 1);
    } catch(e) {
        console.log(e); // 30
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
async function CheckUserVerify(id: string):Promise<boolean>{
    // DONE: função enxuta versão 0.0.0
    const pool = new Pool({ connectionString: connectionStringWebUser });
    try {
        var queryString: string = "SELECT * FROM users WHERE id = $1"
        let result = await pool.query(queryString, [id]);
        pool.end();
        return (result.rows[0].verify === true);
    } catch(e) {
        console.log("ERROR from CheckUserVerify() in UserTable: ",e);
        console.log("Input function...");
        console.log("id: ", id);
        return false;
    }    
};
// ----------------------------------------------------------------------------
async function UpdatePasswordById(userId: string, userPW:string):Promise<boolean>{
    var returnValue:boolean = false; 
    try {
        const pool = new Pool({ connectionString: connectionStringWebUser });
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            var queryString: string = "UPDATE users SET userpw = $1 WHERE id = $2";
            client.query(queryString, [userPW, userId]);
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            console.log(e);
            throw e
        } finally {
            returnValue = true;
            client.release();
        }
        pool.end();
        return returnValue;
    } catch(e) {
        console.log("ERROR from UpdatePasswordById() in UserTable: ",e); // 30
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
async function DeactivateUser(userId: string):Promise<boolean>{
    var returnValue:boolean = false; 
    try {
        const pool = new Pool({ connectionString: connectionStringWebUser });
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            var queryString: string = "UPDATE access_keys SET active_record = FALSE WHERE id = $1";
            client.query(queryString, [userId]);
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            console.log(e);
            throw e
        } finally {
            returnValue = true;
            client.release();
        }
        pool.end();
    } catch(e) {
        console.log("ERROR from DeactivateUser() in UserTable: ", e); // 30
    } finally{
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
async function ChangeUserEmail(user_id: string, email_id: string):Promise<boolean>{
    var returnUserOK:boolean = false,
        returnEmailOK:boolean = false; 
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var result: any;
    var queryString: string;
    var extraEmail: pgInterfaceExtraEmail = {id: -1};
    var user: pgInterfaceUser = {id: -1};
    try {
        queryString = "SELECT * FROM extra_email WHERE id = $1";
        result = await pool.query(queryString, [email_id]);
        extraEmail = result.rows[0];
        queryString = "SELECT * FROM users WHERE id = $1";
        result = await pool.query(queryString, [user_id]);
        user = result.rows[0];
        // console.log("user.verify,extraEmail.verify",user.verify,extraEmail.verify)
        if ((user.verify) && (extraEmail.verify))
        {
            var newExtraEmail:string   = EncriptString(DencriptString(<string>user.email,user.id.toString()), extraEmail.id.toString());
            var newMainEmail:string    = EncriptString(DencriptString(<string>extraEmail.email,extraEmail.id.toString()), user.id.toString());

            var client = await pool.connect();
            try {
                await client.query('BEGIN');
                queryString = "UPDATE users SET email = $2 WHERE id = $1";
                client.query(queryString, [user_id,newMainEmail]);
                await client.query('COMMIT');
            } catch (e) {
                await client.query('ROLLBACK');
                console.log(e);
                throw e
            } finally {
                returnUserOK = true;
                client.release();
            }
            queryString = "UPDATE extra_email SET email = $2 WHERE id = $1";
            result = await pool.query(queryString, [email_id,newExtraEmail]);
            returnEmailOK = true;
        }
        pool.end();
        return (returnEmailOK && returnUserOK);
    } catch(e) {
        console.log("ERROR from ChangeUserEmail() in UserTable: ", e); // 30
        return (returnEmailOK && returnUserOK);
    }
}
// ----------------------------------------------------------------------------
async function getInstituionIdbyUserId(user_id: string):Promise<number>{
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var returnValue: number = -1;
    try {
        let result = await pool.query("SELECT * FROM users WHERE id = $1", [user_id]);
        if (result.rowCount > 0){
            let dbVal = result.rows[0].institution_id
            returnValue = (dbVal === undefined || dbVal === null)  ? -1 : result.rows[0].institution_id;
        }
        pool.end();
    } catch(e) {
        console.log("ERROR from getInstituionIdbyUserId() in UserTable: ", e); // 30
    } finally{
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
async function getPrivilegeByUserId(user_id: string):Promise<string>{
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var returnValue: string = "-1";//, privilege_id = "5";

    try {
        var result = await pool.query("SELECT * FROM users WHERE id = $1", [user_id]);
        
        if (result.rowCount > 0){
            //console.log("getPrivilegeByUserId",result.rows[0])
            // console.log("getPrivilegeByUserId",Number(result.rows[0].privilege_id))
            returnValue = (result.rows[0].privilege_id === undefined) ? "5" : result.rows[0].privilege_id;
        }
        // if (privilege_id !== "-1"){
        //     result = await pool.query("SELECT * FROM user_privilege WHERE id = $1", [privilege_id]);
        //     returnValue = result.rows[0].privilege_value;
        // }
        pool.end();
    } catch(e) {
        console.log("ERROR from getPrivilegeByUserId() in UserTable: ", e); // 30
    } finally{
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
export {CheckUserOnDataBase,
        CheckEmailOnDataBase,
        GetUserById,
        GetUserID,
        GetUserEmailById,
        GetUserUserNameById,
        CheckUserPW,
        AddUserOnDatabase,
        RemUserFromDataBaseById,
        VerifyUser,
        UnverifyUser,
        CheckUserVerify,
        CheckUserNeedPwUpdate,
        CheckPasswordAreadyUpdated,
        UpdatePasswordById,
        DeactivateUser,
        ChangeUserEmail,
        getInstituionIdbyUserId,
        getPrivilegeByUserId};