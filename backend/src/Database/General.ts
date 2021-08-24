import { Pool } from "pg";
import { DencriptString } from "../Cryptography/CryptoString";
import child from "child_process";
import util from "util";
import path from "path";
// ----------------------------------------------------------------------------
const connectionStringAdmim = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
const connectionStringWebUser = `postgres://${process.env.DB_WEBUSER}:${process.env.DB_WEBPASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

// ----------------------------------------------------------------------------
async function InsertOnTable(tableName: string, Data: any):Promise<string>{
    var returnValue: string = "-1";
    const pool = new Pool({ connectionString: connectionStringAdmim });
    var tableNames:string[] = [];
    try{
        const result = await pool
            .query("insert * from information_schema.tables WHERE table_schema='public'");
        pool.end();
        if (result.rowCount > 0){    
            for(let i = 0; i < result.rowCount; i++)
                tableNames.push(result.rows[i].table_name);      
        }
    } catch (e){
        console.log("ERROR from getPublicTables() in General: ", e.stack.split("at")[0]);
    } finally{
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
async function RemoveOfTableById(tableName: string, id: string):Promise<string>{
    return "-1";
}
// ----------------------------------------------------------------------------
async function UpdateInTableById(tableName: string, id: string, fieldName: string, Data: any):Promise<string>{
    return "-1";
}
// ----------------------------------------------------------------------------
async function CheckDataBase():Promise<boolean>{
    var dbIsUp = false;
    try{
        const pool = new Pool({ connectionString: connectionStringAdmim });
        var result = await pool.connect();
        pool.end()
        dbIsUp =  true;
    } catch (e) {
        console.log("ERROR from CheckDataBase() in General: ", e.stack.split("at")[0]);
    } finally{
        return dbIsUp;
    }
};
// ----------------------------------------------------------------------------
// async function getTables():Promise<string[]> {
//     const pool = new Pool({ connectionString: connectionStringAdmim });
//     var tableNames:string[] = [];
//     try{
//         const result = await pool
//             .query("select * from information_schema.tables WHERE table_schema='public'");
//         pool.end();
//         if (result.rowCount > 0){    
//             for(let i = 0; i < result.rowCount; i++)
//                 tableNames.push(result.rows[i].table_name);      
//         }
//     } catch (e){
//         console.log("ERROR from getPublicTables() in General: ", e.stack.split("at")[0]);
//     } finally{
//         return tableNames;
//     }
// }
// ----------------------------------------------------------------------------
async function checkTableExist(tableName: string):Promise<boolean> {
    const pool = new Pool({ connectionString: connectionStringAdmim });
    var tableExist:boolean = false,
        // queryString:string = "select $1 from information_schema.tables WHERE table_schema='public'";
        queryString:string = "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE  table_schema ='public' AND table_name = $1);";
    try{
        const result = await pool
            .query(queryString,[tableName]);
        pool.end();
        tableExist = result.rows[0].exists
    } catch (e){
        console.log("ERROR from checkTableExist() in General: ", e.stack.split("at")[0]);
    } finally {
        return tableExist;
    }
}
// ----------------------------------------------------------------------------
async function getAllDataFromTable(tableName: string, user_id: string = "-1", deactivate: boolean = false, decript:boolean = false):Promise<any[]> {
    const pool = new Pool({ connectionString: connectionStringAdmim });
    var tableNames:any = [], QS, userid_QS, deactivate_QS: string;

    QS = `select * from ${tableName}`;

    // console.log("getAllDataFromTable, QS:",QS)
    try{
        var result = await pool
            .query(QS);
        pool.end();
        for(let i = 0; i < result.rowCount; i++)
            tableNames.push(result.rows[i]); 
        
    } catch (e){
        console.log("ERROR from getAllDataFromTable() in General: ", e); //e.stack.split("at")[0]
    } finally {
        return tableNames;
    }
}
// ----------------------------------------------------------------------------
export {connectionStringAdmim, 
        connectionStringWebUser,
        CheckDataBase,
        // getTables,
        checkTableExist,
        getAllDataFromTable
        //getDecriptDataFromTable,
        //SolveUserNameById,
        //CheckOnDataBase,
    };