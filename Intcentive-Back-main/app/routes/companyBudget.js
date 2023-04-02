const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const Responsedata = require("../middleware/response");
const { v4: uuidv4 } = require("uuid");
// const ormPg = require('../lib/ormPg');
const databaseContextPg = require("database-context-pg");
const systemService = require("../lib/api/system");
const vehicleService = require("../lib/api/vehicle");
const { isArray, isNumber, isPlainObject, now } = require("lodash");
const moment = require("moment");

const router = express.Router();

const connectionSetting = require("../dbconnect");
const padZero = require("../lib/padZero");
const permissionService = require("../lib/api/permission");
const connectionConfig = connectionSetting.config;
const condb = new databaseContextPg(connectionConfig);
const queryCompanyBudget = require("../query/queryCompanyBudget.json");

/**
 * Filter News Part
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

const filtercompanybudget = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;

    const callback = await condb.clientQuery(
      queryCompanyBudget.searchLike,
      [
        body.company_id,
        body.cb_budget_year,
      ]);
    console.log(callback.rows);
    const data = {
      company_budget_list: callback.rows
    }
    console.log(data)
    return response.success(data);
  } catch (error) {
    return response.error([{
      errorcode: 400,
      errorDis: error.message
    }])
  }
};
router.post("/filtercompanybudget", [authenticateToken], filtercompanybudget);

/**
 * Add News
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const add_companybudget = async (req, res, next) => {
  const response = new Responsedata(req, res);
  const error_list = [];
  try {
    const user_token = response.getPayloadData()
    const body = req.body;
    console.log(body);
    const id = uuidv4()

    const model = {
      cb_id: id,
      cb_company_id: body.company_id,
      cb_budget_year: body.cb_budget_year,
      cb_budget_amount: body.cb_budget_amount,
      cb_is_use: true,
      cb_create_by: user_token.fup,
      cb_update_by: user_token.fup,
      cb_create_date: new Date(),
      cb_update_date: new Date(),
    }
    console.log(model);

    const callback = await condb.insert("company_budget", model);

    return response.success({ cb_id: id });
  } catch (error) {
    return response.error([{
      errorcode: 400,
      errorDis: error.message
    }])
  }
};
router.post("/addcompanybudget", [authenticateToken], add_companybudget);

/**
 * Get Award Point
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const get_companybudget = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const { cb_id } = req.body;

    const callback = await condb.findAll("company_budget", {
      where: [
        { key: "cb_is_use", value: true },
        { key: "cb_id", value: cb_id },
      ],
    });

    const data = {
      company_budget_list: [],
    };

    for (const key in callback) {
      if (Object.hasOwnProperty.call(callback, key)) {
        const item = callback[key];

        const _data = {
          cb_id: item.cb_id,
          cb_budget_year: item.cb_budget_year,
          cb_budget_amount: item.cb_budget_amount,
        };
        data.company_budget_list.push(_data);
      }
    }

    return response.success(data);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/get_companybudget", [authenticateToken], get_companybudget);
// router.post('/getthankpoint/:tp_id', [authenticateToken], GetThankPoint);

/**
 * Edit Award Point
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const edit_companybudget = async (req, res, next) => {
  const response = new Responsedata(req, res);
  const error_list = [];
  try {
    // const orm = new ormPg();
    const user_token = response.getPayloadData();
    const body = req.body;

    if (body.cb_budget_year == "" || !body.cb_budget_year) {
      error_list.push({
        errorcode: 400,
        errorDis: "Not found budget year",
      });
    }

    if (error_list.length > 0) {
      return response.error(error_list);
    }

    const findData = await condb.findOne("company_budget", {
      where: [
        { key: "cb_id", value: body.cb_id },
        // { key: "tp_point_id", operators: "!=", value: body.tp_point_id },
        { key: "cb_is_use", value: true },
      ],
    });

    if (!findData) {
      return response.error([
        {
          errorcode: 400,
          errorDis: "Budget year will be the unique.",
        },
      ]);
    }

    const model = {
      cb_budget_year: body.cb_budget_year,
      cb_budget_amount: body.cb_budget_amount,
      cb_update_date: new Date(),
      cb_update_by: user_token.fup,
    };

    const callback = await condb.update("company_budget", model, body.cb_id);

    return response.success({ cb_id: body.cb_id });
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/edit_companybudget", [authenticateToken], edit_companybudget);

/**
 * Delete Award Point
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const delete_companybudget = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    // const orm = new ormPg();
    const user_token = response.getPayloadData();
    const body = req.body;
    console.log(body);
    const findData = await condb.findOne("company_budget", {
      where: [
        { key: "cb_is_use", value: true },
        { key: "cb_id", value: body.cb_id },
      ],
    });
    console.log(findData);

    if (!findData) {
      return response.error([
        {
          errorcode: 400,
          errorDis: "ไม่พบข้อมูล",
        },
      ]);
    }

    const chackDel = await condb.clientQuery(queryCompanyBudget.chackDel, [
      body.company_id,
      body.cb_budget_year,
    ]);
    console.log(chackDel.rows);

    if (chackDel.rows.length !== 0) {
      return response.error([
        {
          errorcode: 400,
          errorDis: "งบประมาณถูกใช้ไปแล้ว ไม่สามารถลบได้",
        },
      ]);
    }

    const model = {
      cb_is_use: false,
      cb_update_date: new Date(),
      cb_update_by: user_token.fup,
    };

    const callback = await condb.update("company_budget", model, body.cb_id);

    return response.success({ cb_id: body.cb_id });
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/delete_companybudget", [authenticateToken], delete_companybudget);

/**
 * Delete Award Point
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const getCompanyBudgetYear = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    console.log(body);
    const findData = await condb.clientQuery(queryCompanyBudget.getYear, [
      body.company_id
    ]);

    const yearNow = [];
    for (let i = 0; i < findData.rows.length; i++) {
      if (findData.rows[i].cby_year == new Date().getFullYear()) {
        yearNow.push(findData.rows[i]);
      }
    }

    let data = {
      select_year: findData.rows,
      year_now: yearNow
    }
    console.log(data);

    return response.success(data);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/getCompanyBudgetYear", [authenticateToken], getCompanyBudgetYear);

module.exports = router;
