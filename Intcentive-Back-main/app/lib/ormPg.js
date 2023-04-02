const { isPlainObject, isArray } = require('lodash');
const { Client } = require('pg');
const connectionSetting = require("../dbconnect");
const connectionConfig = connectionSetting.config;

class ormPg {
    constructor() {

    }

    async clientQuery(queryConfig, value) {
        return new Promise(async (resolve, reject) => {
            try {
                (async () => {
                    const client = new Client(connectionConfig);
                    await client.connect();
                    try {
                        const callback = await client.query(queryConfig, value);
                        resolve(callback);
                    } catch (e) {
                        reject(e);
                    } finally {
                        await client.end();
                    }
                })().catch((e) => {
                    console.log(e);
                    // throw Error(e);
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    };

    async columnsTable(table, schema = "public") {
        const sql = `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = $1 AND table_schema = $2`
        const callback = await this.clientQuery(sql, [table, schema])
        return callback.rows
    }

    async columnsPkTable(table, schema = "public") {
        const sql = `
        SELECT KU.table_name as TABLENAME ,column_name as PRIMARYKEYCOLUMN 
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS TC 
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KU
            ON TC.CONSTRAINT_TYPE = 'PRIMARY KEY' 
            AND TC.CONSTRAINT_NAME = KU.CONSTRAINT_NAME 
            AND KU.table_name=$1
            AND KU.table_schema=$2
        ORDER BY KU.TABLE_NAME ,KU.ORDINAL_POSITION;`
        const callback = await this.clientQuery(sql, [table, schema])
        return callback.rows.length > 0 ? callback.rows[0] : null
    }

    async insert(table, model, schema = "public") {
        let i = 1;
        const columns = [], _ = [], values = [];

        for (const [key, value] of Object.entries(model)) {
            columns.push(key);
            _.push(`$${i}`);
            values.push(value);
            i++;
        }
        let sql = `INSERT INTO ${schema}.${table} (${columns.toString()}) VALUES (${_.toString()})`;
        console.log(sql)
        const callback = await this.clientQuery(sql, values);
        return callback;
    }

    async findByPk(table, id, schema = "public") {
        const { primarykeycolumn } = await this.columnsPkTable(table, schema);
        let sql = `SELECT * FROM ${schema}.${table} WHERE ${primarykeycolumn} = $1`;
        console.log(sql);
        const callback = await this.clientQuery(sql, [id]);
        return callback.rows.length > 0 ? callback.rows[0] : null;
    }

    async update(table, model, id, schema = "public") {
        const columns = [], values = [`${id}`];

        let i = 2;
        for (const [key, value] of Object.entries(model)) {
            if (value || value == "" || value == false) {
                columns.push(`${key}=$${i}`);
                values.push(value);
                i++;
            }
        }
        const { primarykeycolumn } = await this.columnsPkTable(table, schema);
        let sql = `UPDATE ${schema}.${table} SET ${columns.toString()} WHERE ${primarykeycolumn}=$1 `
        console.log(sql);
        const callback = await this.clientQuery(sql, values);

        return callback?.rowCount <= 0 ? undefined : id;
    }

    async findAll(table, model = {}, schema = "public") {
        const { primarykeycolumn } = await this.columnsPkTable(table, schema);

        const text_count = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        let sql = `SELECT * FROM ${schema}.${table} AS ${text_count[0]} `;
        let num_count = 1;
        ["left_join", "right_join", "inner_join"].forEach(value => {
            if (isArray(model[value])) {
                model[value].forEach(item => {
                    const as_name = `${item.as ?? text_count[num_count]}`, schema = item.schema ?? "public", split = value.split('_')
                    sql += `${split[0].toUpperCase()} ${split[1].toUpperCase()} ${schema}.${item.table} AS ${as_name} ON ${as_name}.${item.on} = ${text_count[0]}.${item.id ?? primarykeycolumn} `
                    if (!item.as) num_count++
                });
            }
        })

        let value_count = 1, value_list = [];
        if (isArray(model.where)) {
            model.where.forEach((item, index) => {
                const key = item.key, value = item.value, as_name = item.as ?? null, type = item.type ?? "AND", operators = item.operators ?? "="
                value_list.push(value)
                sql += `${index === 0 ? "WHERE" : ` ${type}`} ${as_name ? `as_name.` : ""}${key} ${operators} $${value_count}`
                value_count++
            });
        }
        console.log(sql);
        const callback = await this.clientQuery(sql, value_list.length <= 0 ? undefined : value_list);
        return callback.rows
    }

    async findOne(table, model = {}, schema = "public") {
        const callback = await this.findAll(table, model, schema);
        return callback.length > 0 ? callback[0] : undefined
    }


}

module.exports = ormPg;