const {
    Client,
    Pool
} = require('pg')
const connectionSetting = require('../dbconnect');
const connectionPool = connectionSetting.connectionPool;
const connectionConfig = connectionSetting.config;

class baseService {
    TestConnnect() {
        return new Promise(((resolve, reject) => {
            connectionPool.connect((err, db) => {
                if (err) reject(err);
                db.query('SELECT NOW()', (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                })
            });
        }));
    }
    selectAll(table) {
        return new Promise(((resolve, reject) => {
            connectionPool.connect((err, db) => {
                if (err) reject(err);
                db.query('SELECT * FROM ' + table, (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                })
            });
        }));
    }
    TestConnnect2() {
        return new Promise(((resolve, reject) => {
            var client = new Client(connectionConfig)
            client.connect((err, db) => {
                if (err) reject(err);
                db.query('SELECT NOW()').then(result => resolve(result)).catch(err => reject(err)).then(() => client.end());
            })

        }))
    }
    baseQuery(stringQuery) {
        return new Promise(((resolve, reject) => {
            var client = new Client(connectionConfig)
            client.connect((err, db) => {
                if (err) reject(err);
                db.query(stringQuery).then(result => resolve(result)).catch(err => reject(err)).then(() => client.end());
            })

        }))
    }
    baseQueryWithParameter(stringQuery, Parameter) {
        return new Promise(((resolve, reject) => {
            (async () => {
                var client = new Client(connectionConfig)
                await client.connect();
                try {
                    var query = await client.query(stringQuery, Parameter);
                    resolve(query);
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
    baseQueryWithParameterOsl(stringQuery, Parameter) {
        return new Promise(((resolve, reject) => {
            (async () => {
                var client = new Client(connectionConfig)
                await client.connect();
                try {
                    var query = await client.query(stringQuery, Parameter);
                    resolve(query);
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

}
module.exports = baseService;