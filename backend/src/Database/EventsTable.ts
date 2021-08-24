import { Request } from "express";
import { Pool } from "pg";
import {connectionStringWebUser}  from "./General";

// NOTE: sem efeito da tag "active_record"
// ============================================================================
// ----------------------------------------------------------------------------
function clearEventName(eventName:string):string{
    var eventTemp:string = eventName;
    let indexofslide = eventTemp.indexOf("/", 1);
    if (indexofslide > 0)
        eventTemp = eventTemp.substr(0,indexofslide);
    return eventTemp;
}
// ----------------------------------------------------------------------------
async function GetEventId(req?: Request, eventName?: string):Promise<Number>{
    var returnValue: Number = -1;
    const pool = new Pool({ connectionString: connectionStringWebUser });
    var eventTemp:string = (eventName === undefined) ?  "" : eventName;
    if (req !== undefined)
        eventTemp = req.path;
    eventTemp = clearEventName(eventTemp);
    try {
        let result = await pool.query("SELECT * FROM events WHERE event_name = $1", [eventTemp]);
        pool.end();
        if (result.rowCount > 0)
            returnValue = Number(<string>(result.rows[0].id));
    } catch(e) {
        console.log("ERROR from GetEventId() in LogAccessTable: ", e.stack.split("at")[0]);
    } finally {
        return returnValue;
    }
}
// ----------------------------------------------------------------------------
export {GetEventId};