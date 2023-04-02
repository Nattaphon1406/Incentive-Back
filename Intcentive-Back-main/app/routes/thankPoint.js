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

const queryThankPoint = require('../query/queryThankPoint');

/**
* Filter Thank Point Part
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/

const FilterThankPoint = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const body = req.body;
        // console.log(body);

        const maxPoint = await condb.clientQuery(
            queryThankPoint.maxTpPoint, [body.company_id]
        );

        const callback = await condb.clientQuery(
            queryThankPoint.searchLike,
            [
                body.company_id,
                body.tp_point_id || null,
                body.tp_point_name || null,
                body.tp_point_min ? (isNaN(body.tp_point_min) ? 0 : body.tp_point_min) : 0,
                body.tp_point_max ? (isNaN(body.tp_point_max) ? 0 : body.tp_point_max) : maxPoint.rows[0].max_point
            ]);
        const data = {
            thank_point_list: callback.rows
        }

        return response.success(data);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/filterThankPoint', [authenticateToken], FilterThankPoint);

/**
* Add Thank Point
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const AddThankPoint = async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {
        // const orm = new ormPg();
        const user_token = response.getPayloadData()
        const body = req.body;
        console.log(body);

        const findCheckId = await condb.clientQuery(
            queryThankPoint.chackThankPointID, [
            body.tp_point_id,
        ]);

        const findCheckName = await condb.clientQuery(
            queryThankPoint.chackThankPointName, [
            body.tp_point_name,
            body.company_id,
        ]);

        console.log(findCheckId.rows.length, findCheckName.rows.length);
        if (findCheckId.rows.length != 0 || findCheckName.rows.length != 0) {
            return response.error([{
                errorcode: 400,
                errorDis: "มี ID หรือชื่อซ้ำกับในระบบแล้ว!"
            }])
        }

        const id = uuidv4()

        const model = {
            tp_point_id: body.tp_point_id,
            tp_point_name: body.tp_point_name,
            tp_point: body.tp_point,
            tp_point_detail: body.tp_point_detail,
            tp_company_id: body.company_id,
            tp_image_name: body.tp_image_name,
            tp_image_path: body.tp_image_path,
            tp_is_active: body.tp_is_active,
            tp_is_use: true,
            tp_create_by: user_token.fup,
            tp_update_by: user_token.fup,
        }

        const callback = await condb.insert("thank_point", model);

        return response.success({ tp_id: id });
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/addthankpoint', [authenticateToken], AddThankPoint);

/**
* Get Thank Point
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const GetThankPoint = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {

        const { tp_id } = req.body;

        const callback = await condb.findAll("thank_point", {
            where: [
                { key: "tp_is_use", value: true },
                { key: "tp_id", value: tp_id }
            ]
        });

        const data = {
            thank_point_list: [],
        }

        for (const key in callback) {
            if (Object.hasOwnProperty.call(callback, key)) {
                const item = callback[key];

                const _data = {
                    tp_id: item.tp_id,
                    tp_point_id: item.tp_point_id,
                    tp_point_name: item.tp_point_name,
                    tp_point: item.tp_point,
                    tp_point_detail: item.tp_point_detail,
                    tp_image_name: item.tp_image_name,
                    tp_image_path: item.tp_image_path,
                }
                data.thank_point_list.push(_data)
            }
        }

        return response.success(data);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/getthankpoint', [authenticateToken], GetThankPoint);
// router.post('/getthankpoint/:tp_id', [authenticateToken], GetThankPoint);

/**
* Edit Thank Point
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const EditThankPoint = async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {
        // const orm = new ormPg();
        const user_token = response.getPayloadData()
        const body = req.body;
        console.log(body);

        const findCheckId = await condb.clientQuery(
            queryThankPoint.chackThankPoinIdByID, [
            body.tp_point_id,
            body.tp_id,
        ]);

        const findCheckName = await condb.clientQuery(
            queryThankPoint.chackThankPoinNameByID, [
            body.tp_point_name,
            body.tp_id,
            body.company_id,
        ]);

        console.log(findCheckId.rows.length, findCheckName.rows.length);
        if (findCheckId.rows.length != 0 || findCheckName.rows.length != 0) {
            return response.error([{
                errorcode: 400,
                errorDis: "มี ID หรือชื่อซ้ำกับในระบบแล้ว!"
            }])
        }

        const model = {
            tp_point_id: body.tp_point_id,
            tp_point_name: body.tp_point_name,
            tp_point: body.tp_point,
            tp_point_detail: body.tp_point_detail,
            tp_image_name: body.tp_image_name,
            tp_image_path: body.tp_image_path,
            tp_update_date: new Date(),
            tp_update_by: user_token.fup,
        }

        const callback = await condb.update("thank_point", model, body.tp_id)


        return response.success({ tp_id: body.tp_id });
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/editthankpoint', [authenticateToken], EditThankPoint);

/**
* Delete Thank Point
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const DeleteThankPoint = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        // const orm = new ormPg();
        const user_token = response.getPayloadData()
        const { tp_id } = req.params;


        const findData = await condb.findOne("thank_point", {
            where: [
                { key: "tp_is_use", value: true },
                { key: "tp_id", operators: "=", value: tp_id }
            ]
        });

        if (!findData) {
            return response.error([{
                errorcode: 400,
                errorDis: "ไม่พบข้อมูล"
            }])
        }

        const model = {
            tp_is_use: false,

            tp_update_date: new Date(),
            tp_update_by: user_token.fup,
        }

        const callback = await condb.update("thank_point", model, tp_id)


        return response.success({ tp_id: tp_id });
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.get('/deletethankpoint/:tp_id', [authenticateToken], DeleteThankPoint);

/**
* Change Manage Group Product
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const ChangeStatusCategory = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const user_token = response.getPayloadData()
        const { tp_id } = req.params;
        console.log(tp_id);

        const findData = await condb.findOne("thank_point", {
            where: [
                { key: "tp_is_use", value: true },
                { key: "tp_id", operators: "=", value: tp_id }
            ]
        });
        console.log(findData);
        var status;
        findData.tp_is_active == true ? status = false : status = true;
        console.log(findData.tp_is_active);

        const model = {
            tp_is_active: status,
            tp_update_date: new Date(),
        }
        const callback = await condb.update("thank_point", model, tp_id)

        return response.success({ tp_id: tp_id });
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.get('/changeStatusThankpoint/:tp_id', [authenticateToken], ChangeStatusCategory);


module.exports = router;