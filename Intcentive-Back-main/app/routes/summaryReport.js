const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const Responsedata = require('../middleware/response');
const { v4: uuidv4 } = require('uuid');
// const ormPg = require('../lib/ormPg');
const databaseContextPg = require('database-context-pg');
const systemService = require('../lib/api/system');
const vehicleService = require('../lib/api/vehicle');
const { isArray, isNumber, isPlainObject } = require('lodash');
const moment = require('moment');

const router = express.Router();

const connectionSetting = require("../dbconnect");
const padZero = require('../lib/padZero');
const permissionService = require('../lib/api/permission');
const connectionConfig = connectionSetting.config;
const condb = new databaseContextPg(connectionConfig)
const connectionConfig2 = connectionSetting.config2;
const condb2 = new databaseContextPg(connectionConfig2)

const querySummaryReport = require('../query/querySummaryReport.json');

/**
* Filter User Point Data
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const FilterUserPoint = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {

        const pointData = await condb.clientQuery(
            querySummaryReport.getUserPoint, []);

        const data = {
            point_detail: pointData.rows,
        }

        return response.success(data);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.get('/filterUserPoint', [authenticateToken], FilterUserPoint);

/**
* Filter User Data
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const FilterUserData = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const body = req.body;

        const UserDetail = [];
        for (var i = 0; i < body.length; i++) {
            var userData = await condb2.clientQuery(
                querySummaryReport.getUserDetail,
                [
                    body[i],
                ]);
            UserDetail.push(userData.rows[0]);
        }
        const data = {
            user_detail: UserDetail,
        }
        console.log(data);
        return response.success(data);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/filterUserData', [authenticateToken], FilterUserData);

/**
* Filter Redeem Data
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const FilterRedeemData = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const body = req.body;

        var date_from = new Date(body.date_start);
        date_from.setHours(7);
        console.log(date_from.toISOString());
        var date_to = new Date(body.date_end);
        date_to.setDate((date_to.getDate() + 1));
        date_to.setHours(6);
        date_to.setMinutes(59);
        date_to.setSeconds(59);
        console.log(date_to.toISOString());

        var redeemData = await condb.clientQuery(
            querySummaryReport.getRedeemDetail,
            [
                body.company_id,
                body.oem_id,
                date_from.toISOString(),
                date_to.toISOString(),
            ]);
        const data = {
            redeem_detail: redeemData.rows,
        }

        return response.success(data);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/filterRedeemData', [authenticateToken], FilterRedeemData);



module.exports = router;