var dbConnect = require('../appSetting.js');
/* var queryLog = require("../query/queryLog.json"); */
const { Client,Pool } = require('pg')
var moment = require("moment");
var {
    v4: uuidv4
} = require('uuid');
// let oem_id = uuidv4();
var configLog = dbConnect.dbConnect.dbLogConnect;
class logService {
    async log(model) {
        return new Promise(((resolve, reject) => {
            (async () => {
                var client = new Client(configLog)
                await client.connect();
                try {
                    // await client.query(queryLog.add, [model.id, model.date, model.activity]);
                    resolve(true);
                } catch (e) {
                    reject(e);
                } finally {
                    await client.end();
                }
            })().catch(e => {
                console.log(e);
                reject(e);
            })
        }))
    }
    get model() {
        return {
            id: uuidv4(),
            date: moment(new Date()),
            activity: {
                status: true,
                path: "",
                parameter: {},
                response:{},
                error: {}
            }
        }
    }
    // logModel = {
    //     id: uuidv4(),
    //     date: moment(new Date()),
    //     activity: {
    //         status: true,
    //         path: "",
    //         parameter: {},
    //         error: {}
    //     }
    // }
    // Eaction = {
    //     add: "add",
    //     edit: "edit",
    //     del: "del",
    //     find: "find",
    //     filter: "filter",
    //     upload: "upload",
    //     login: "login",
    //     logout: "logout"
    // }

}
module.exports = logService