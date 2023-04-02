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

const queryManageProduct = require('../query/queryManageProduct.json');

/**
* Filter Manage Product
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const FilterManageProduct = async (req, res, next) => {
    console.log("FilterManageProduct");
    const response = new Responsedata(req, res);
    try {
        const body = req.body;

        const callback = await condb.clientQuery(
            queryManageProduct.searchLike,
            [
                body.company_id,
                body.product_name || null,
                body.product_category_id || null
            ]);

        const data = {
            product_list: callback.rows
        }

        return response.success(data);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/filterManageProduct', [authenticateToken], FilterManageProduct);

/**
* Get Product Category
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const GetProductCategory = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const body = req.body;

        const _where = {
            where: [
                { key: "category_is_use", value: true }
            ]
        }

        if (body.company_id != "" && body.company_id) {
            _where.where.push(
                { key: "category_company_id", value: body.company_id });
        }

        const callback = await condb.findAll("category", _where);

        const data = {
            category_list: []
        }

        for (const key in callback) {
            if (Object.hasOwnProperty.call(callback, key)) {
                const item = callback[key];
                const _data = {
                    category_id: item.category_id,
                    category_name: item.category_name,
                }

                data.category_list.push(_data)
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
router.post('/productCategory', [authenticateToken], GetProductCategory);

/**
* Delete Product Category
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const DeleteProductCategory = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        // const orm = new ormPg();
        const user_token = response.getPayloadData()
        const { category_id } = req.params;


        const findData = await condb.findOne("category", {
            where: [
                { key: "category_is_use", value: true },
                { key: "category_id", operators: "=", value: category_id }
            ]
        });

        if (!findData) {
            return response.error([{
                errorcode: 400,
                errorDis: "ไม่พบข้อมูล"
            }])
        }

        const model = {
            category_is_use: false,

            category_update_date: new Date(),
            category_update_by: user_token.fup,
        }

        const callback = await condb.update("category", model, category_id)


        return response.success({ category_id: category_id });
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.get('/deleteProductCategory/:category_id', [authenticateToken], DeleteProductCategory);

/**
* Get Product
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const GetProduct = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {

        const { product_id } = req.params;

        const callback = await condb.findAll("product", {
            where: [
                { key: "product_is_use", value: true },
                { key: "product_id", value: product_id },
                { key: "category_is_use", value: true }
            ],
            left_join: [
                { table: "category", on: "category_id", id: "product_category_id" }
            ]
        });

        const data = {
            product_list: [],
        }

        for (const key in callback) {
            if (Object.hasOwnProperty.call(callback, key)) {
                const item = callback[key];

                const _data = {
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_detail: item.product_detail,
                    product_image_name: item.product_image,
                    product_image_path: item.product_image_path,
                    product_point: item.product_point,
                    product_category_id: item.product_category_id,
                }
                data.product_list.push(_data)
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
router.post('/getproduct/:product_id', [authenticateToken], GetProduct);

/**
* Add Product
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const AddProduct = async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {
        // const orm = new ormPg();
        const user_token = response.getPayloadData()
        const body = req.body;

        // if (body.product_id == "" || !body.product_id) {
        //     error_list.push({
        //         errorcode: 400,
        //         errorDis: "Not found Product ID."
        //     })
        // }

        // if (error_list.length > 0) {
        //     return response.error(error_list)
        // }

        // const findData = await condb.findOne("product", {
        //     where: [
        //         { key: "product_id", value: body.product_id },
        //     ]
        // });

        // if (findData) {
        //     return response.error([{
        //         errorcode: 400,
        //         errorDis: "Product ID No will be the unique."
        //     }])
        // }

        const id = uuidv4()

        const model = {
            product_name: body.product_name,
            product_point: body.product_point,
            product_detail: body.product_detail,
            product_company_id: body.company_id,
            product_image: body.product_image_name,
            product_image_path: body.product_image_path,
            product_category_id: body.product_category_id,
            product_is_use: true,
            product_create_by: user_token.fup,
            product_update_by: user_token.fup,
        }

        const callback = await condb.insert("product", model);

        return response.success({ product_id: id });
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/addproduct', [authenticateToken], AddProduct);

/**
* Edit Product
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const EditProduct = async (req, res, next) => {
    const response = new Responsedata(req, res);
    const error_list = [];
    try {
        // const orm = new ormPg();
        const user_token = response.getPayloadData()
        const body = req.body;

        // if (body.product_id == "" || !body.product_id) {
        //     error_list.push({
        //         errorcode: 400,
        //         errorDis: "Not found Product ID."
        //     })
        // }

        // if (error_list.length > 0) {
        //     return response.error(error_list)
        // }

        // const findData = await condb.findOne("product", {
        //     where: [
        //         { key: "product_id", value: body.product_id },
        //     ]
        // });

        // if (findData) {
        //     return response.error([{
        //         errorcode: 400,
        //         errorDis: "Product ID No will be the unique."
        //     }])
        // }

        const findData = await condb.findOne("product", {
            where: [
                { key: "product_id", value: body.product_id },
                { key: "product_is_use", value: true },
            ]
        });

        if (!findData) {
            return response.error([{
                errorcode: 400,
                errorDis: "Product ID No will be the unique."
            }])
        }

        const id = uuidv4()

        const model = {
            product_name: body.product_name,
            product_point: body.product_point,
            product_detail: body.product_detail,
            product_image: body.product_image_name,
            product_image_path: body.product_image_path,
            product_category_id: body.product_category_id,
            product_is_use: true,
            product_update_by: user_token.fup,
            product_update_date: new Date(),
        }

        const callback = await condb.update("product", model, body.product_id);

        return response.success({ product_id: id });
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/editproduct', [authenticateToken], EditProduct);


module.exports = router;