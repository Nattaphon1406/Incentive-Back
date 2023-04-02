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

const queryManageGroupProduct = require('../query/queryManageGroupProduct.json');

/**
* Filter Manage Group Product
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const FilterManageGroupProduct = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const body = req.body;
        console.log(body);

        const callback = await condb.clientQuery(
            queryManageGroupProduct.searchLike,
            [
                body.company_id,
                body.category_name || null,
            ]);

        const data = {
            category_list: callback.rows
        }

        return response.success(data);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/filterManageGroupProduct', [authenticateToken], FilterManageGroupProduct);

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
        const { category_id } = req.params;
        console.log(category_id);

        const findData = await condb.findOne("category", {
            where: [
                { key: "category_is_use", value: true },
                { key: "category_id", operators: "=", value: category_id }
            ]
        });
        console.log(findData);
        var status;
        findData.category_is_active == true ? status = false : status = true;

        const model = { category_is_active: status }
        const callback = await condb.update("category", model, category_id)

        return response.success({ category_id: category_id });
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.get('/changeStatusCategory/:category_id', [authenticateToken], ChangeStatusCategory);

/**
* Get Product Group
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const GetProductGroup = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const { category_id } = req.params;
        console.log(category_id);

        const callback = await condb.findOne("category", {
            where: [
                { key: "category_is_use", value: true },
                { key: "category_id", value: category_id },
            ]
        });

        const findData = await condb.clientQuery(
            queryManageGroupProduct.getProductGroup,
            [
                category_id,
            ]);

        const data = {
            category_data: callback,
            product_group: findData.rows,
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
router.post('/getProductGroup/:category_id', [authenticateToken], GetProductGroup);


module.exports = router;