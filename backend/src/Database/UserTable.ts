//require("dotenv").config();
import { Pool } from "pg";
import {pgInterfaceUser} from "../Models/User";
import {encriptString, dencriptString} from "../Cryptography/CryptoString";
import {connectionStringWebUser}  from "./General";
// import {tokenInfoInterface, CheckToken, EncriptPassWord} from "../Cryptography/Authentication";
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
//  QS = `UPDATE alert SET new = false, viewed = to_timestamp(${Date.now()} / 1000.0), completed = to_timestamp(${Date.now()} / 1000.0) WHERE (id = $1 AND user_id = $2);`
//
// ============================================================================

// ----------------------------------------------------------------------------
function DecimalToBase(valor:number, base:number, nDig:number, remRep:boolean):number[]{
    var pot:number[] = [];    
    for(let i = 0; i < nDig; i++){
        pot = [...pot,0];
    }
    var dividendo:number;
    if (remRep) {
        let Snum = (base**(nDig) - 1)/(base - 1);
        let k = Math.trunc(valor/Snum);
        dividendo = valor + k + 1;
    } else{
        dividendo = valor;
    }
    for(let i = 0; i < pot.length; i++){
        if (Math.trunc(dividendo/base) > 0) {
            pot[i] = dividendo % base;
            dividendo = Math.trunc(dividendo/base);
        } else {
            pot[i] = dividendo;
            break;
        }
    }
    return pot;
}
// ----------------------------------------------------------------------------
function ClearAccessKey(access_key:string):string{
  return access_key.replace(/[^A-Za-z0-9@#$&*+?]/g,'');
}
// ----------------------------------------------------------------------------
async function GenerateAccessKeyById(id:string,numChars:number = 4,remSameChar:boolean = true):Promise<string>{
  const pool = new Pool({ connectionString: connectionStringWebUser });
  var seq:string[] = ['A','B','C','D','E','F','G','H','I','J', 
          'K','L','M','N','O','P','Q','R','S','T',
          'U','V','W','X','Y','Z','0','1','2','3',
          '4','5','6','7','8','9','@','#','$','&',
          '*','+','?'];
  var invStr:string = '';
  var Key_Exist:boolean = true;
  try{
    while (Key_Exist){
      var seed = Math.floor((Math.random() * 10**11) + Number(id)*(1 - Math.random())*((Math.random() * 10**12) + 1));
      // console.log("GenerateAccessKeyById 0:",seed,seq.length,numChars,remSameChar);
      var potConv:number[] = DecimalToBase(seed,seq.length,numChars,remSameChar);
      // console.log("GenerateAccessKeyById 1:",potConv);
      for (let j = 0; j < potConv.length; j++)
        invStr = seq[potConv[j]] + invStr;
      let res = await pool.query("SELECT * FROM access_keys WHERE access_key = $1;",[invStr]); 
      Key_Exist = (res.rowCount > 0);
      // console.log("GenerateAccessKeyById 2:",invStr,printConvite(invStr),Key_Exist);
    }
  } catch(e:any){
    console.log("ERROR from GenerateAccessKeyById() in UserTable: ", e.stack.split("at")[0]);
  }finally{
    return invStr;
  }
}
// ----------------------------------------------------------------------------
function printConvite(potConv:string,useDiv:boolean = true, nDiv:number = 4, charDiv:string = '-'):string{
    var invStr:string = '';
    for (let j = 0; j < potConv.length; j++){
        if ((j > 0) && ((j % nDiv) == 0) && useDiv)
            invStr = invStr + charDiv;
        invStr = invStr + potConv[j];
        // invStr = potConv[j] + invStr;
    }
    return invStr;
}
// ----------------------------------------------------------------------------
async function CheckUserOnDataBaseByKey(AccessKey:string):Promise<string>{
    // DONE: função enxuta versão 0.0.0
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var resultID = "-1";
    try {
      var result = await pool.query("SELECT * FROM access_keys WHERE active_record = TRUE;");
      for(let i = 0; i < result.rowCount ; i++)
        if (AccessKey === dencriptString(result.rows[i].access_key,result.rows[i].id)){
            resultID = result.rows[i].id;
            // console.log("Check:",result.rows[i].access_key,result.rows[i].id)
            break;
        }
      pool.end();
    } catch(e:any) {
        console.log("ERROR from CheckUserOnDataBase() in UserTable: ", e.stack.split("at")[0]);
    } finally {
        return resultID;
    } 
};
// ----------------------------------------------------------------------------
async function CheckEmailOnDataBase(EmailValue:string):Promise<string>{
    // DONE: função enxuta versão 0.0.0
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var resultID = "-1";
    try {
        var result = await pool.query("SELECT * FROM access_keys WHERE (active_record = TRUE)");
        for(let i = 0; i < result.rowCount ; i++){
            let emailResult = dencriptString(result.rows[i].email,result.rows[i].id);
            // console.log("check email:",emailResult,result.rows[i].id)
            if (emailResult === EmailValue){
                resultID = result.rows[i].id;
                break;
            }
        }
        pool.end();
    } catch(e:any) {
        console.log("ERROR from CheckEmailOnDataBase() in UserTable: ", e.stack.split("at")[0]);
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
        var queryString: string = "SELECT * FROM access_keys WHERE ((id = $1) AND (active_record = TRUE))"
        let result = await pool.query(queryString, [id]);
        pool.end();
        if (result.rowCount > 0){
            userReturn.id       = Number(id);
            userReturn.user_name = dencriptString(result.rows[0].user_name,id);
            userReturn.email     = dencriptString(result.rows[0].email,id);
            userReturn.created  = result.rows[0].created;
            userReturn.updated  = result.rows[0].updated;
            userReturn.completed    = result.rows[0].completed;
            return userReturn;
        }
        else
            return userReturn;
    } catch(e) {
        console.log("ERROR from GetUserById() in UserTable: ",e); // 30
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
        var queryString: string = "SELECT * FROM access_keys"
        let result = await pool.query(queryString);
        pool.end();
        for(let i = 0; i < result.rowCount ; i++){
            let tableRow = result.rows[i];
            let tempId = tableRow.id;
            let username = dencriptString(<string>tableRow.username,tempId);
            let email = dencriptString(<string>tableRow.email,tempId);
            if ((username.toString().trim() === FieldValue) || (email.toString().trim() === FieldValue)) {
                returnValue = tempId;
                break;
            }
        }
    } catch(e:any) {
        console.log("ERROR from GetUserID() in UserTable: ", e.stack.split("at")[0]);
    } finally{
        return returnValue;
    }
};
// ----------------------------------------------------------------------------
async function GetUserEmailById(id: string):Promise<string>{
    // DONE: função enxuta versão 0.0.0
    var returnValue:string = "";
    const pool = new Pool({ connectionString: connectionStringWebUser });
    try {
        var queryString: string = "SELECT * FROM access_keys WHERE (id = $1 AND active_record = TRUE);"
        let result = await pool.query(queryString, [id]);
        pool.end();
        returnValue = dencriptString(result.rows[0].email as string,id);
    } catch(e) {
        console.log("ERROR from GetUserEmailById() in UserTable: ",e);
    }finally{
        return returnValue; 
    }
}
// ----------------------------------------------------------------------------
// async function GetUserUserNameById(id: string):Promise<string>{
//     // DONE: função enxuta versão 0.0.0
//     var returnValue:string = "";
//     const pool = new Pool({ connectionString: connectionStringWebUser });
//     try {
//         var queryString: string = "SELECT * FROM access_keys WHERE (id = $1 AND active_record = TRUE);"
//         let result = await pool.query(queryString, [id]);
//         pool.end();
//         returnValue = result.rows[0].user_name as string;
//     } catch(e) {
//         console.log("ERROR from GetUserUserNameById() in UserTable: ",e);
//     }finally{
//         return returnValue; 
//     }   
// }
// ----------------------------------------------------------------------------
async function GetAccessKeyById(id: string):Promise<string>{
    // DONE: função enxuta versão 0.0.0
    var returnValue:string = "";
    const pool = new Pool({ connectionString: connectionStringWebUser });
    try {
        var queryString: string = "SELECT * FROM access_keys WHERE (id = $1  AND active_record = TRUE);"
        let result = await pool.query(queryString, [id]);
        pool.end();
        returnValue = dencriptString(result.rows[0].access_key as string, id);
    } catch(e) {
        console.log("ERROR from GetAccessKeyById() in UserTable: ",e);
    }finally{
        return returnValue; 
    }    
}
// ----------------------------------------------------------------------------
async function EncriptUser(userInterface: pgInterfaceUser):Promise<boolean>{
    // TODO: alterar argumento de entrada para interface e criptografar username e email
    var queryString: string = "UPDATE access_keys SET access_key = $1, email = $3, user_name = $4 WHERE id = $2;"
    var returnValue: boolean = false;
                
    userInterface.email = encriptString(userInterface.email,userInterface.id.toString());
    userInterface.user_name = encriptString(userInterface.user_name,userInterface.id.toString());
    const pool = new Pool({ connectionString: connectionStringWebUser });
    const client = await pool.connect();
    try {
        userInterface.access_key = encriptString(
                    await GenerateAccessKeyById(userInterface.id.toString(),Number(process.env.ACCESS_KEY_SIZE))
                    ,userInterface.id.toString());
        if (userInterface.access_key === '')
          return false;
        await client.query('BEGIN');
        const res = await client.query(queryString, [userInterface.access_key,
                    userInterface.id, userInterface.email,userInterface.user_name]);
        await client.query('COMMIT');
        returnValue  = true;
    } catch (e) {
        await client.query('ROLLBACK');
        console.log("ERROR atomic encript of EncriptUser() in UserTable: ",e); // 30
        throw e;
    } finally {
        client.release();
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
async function AddUserOnDatabase(userData: pgInterfaceUser):Promise<string>{
    var returnValue: string = "-1";
    const pool = new Pool({ connectionString: connectionStringWebUser });
    
    try {
        var queryString: string = "INSERT INTO access_keys (user_name,email) VALUES ($1,$2) RETURNING *;";
        // console.log("userData",userData)
        const res = await pool.query(queryString, [userData.user_name,userData.email]);
        pool.end();
        await EncriptUser(res.rows[0] as pgInterfaceUser);
        returnValue = res.rows[0].id;
    } catch (e) {
        console.log("ERROR from AddUserOnDatabase() in UserTable: ",e); // 30
        throw e
    } finally {
        
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
export {CheckUserOnDataBaseByKey,
        CheckEmailOnDataBase,
        GetUserById,
        GetUserID,
        GetUserEmailById,
        // GetUserUserNameById,
        GetAccessKeyById,
        AddUserOnDatabase,
        DeactivateUser,
        printConvite,
        ClearAccessKey};