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
const queryNews = require("../query/queryNews");

/**
 * Filter News Part
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

const filternews = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    console.log(body);

    if (body.news_start_date != null && body.news_end_date == null) {
      var news_start_date = new Date(body.news_start_date);
      news_start_date.setHours(7);
      console.log(news_start_date.toISOString())

      const endDate = await condb.clientQuery(queryNews.maxNews, [
        body.company_id,
      ]);
      console.log(endDate.rows[0].max_date);

      var news_end_date = new Date(endDate.rows[0].max_date);
      news_end_date.setHours(7);
      console.log(news_end_date.toISOString())

      const callback = await condb.clientQuery(queryNews.searchLike, [
        body.company_id,
        body.news_name || null,
        body.news_type_id || null,
        news_start_date.toISOString(),
        news_end_date.toISOString(),
      ]);
      console.log(callback.rows);
      const data = {
        news_list: callback.rows,
      };

      return response.success(data);
    } else if (body.news_start_date == null && body.news_end_date != null) {
      var news_end_date = new Date(body.news_end_date);
      news_end_date.setHours(7);
      console.log(news_end_date.toISOString())

      const endDate = await condb.clientQuery(queryNews.minNews, [
        body.company_id,
      ]);
      console.log(endDate.rows[0].min_date);

      var news_start_date = new Date(endDate.rows[0].min_date);
      news_start_date.setHours(7);
      console.log(news_start_date.toISOString())

      const callback = await condb.clientQuery(queryNews.searchLike, [
        body.company_id,
        body.news_name || null,
        body.news_type_id || null,
        news_start_date.toISOString(),
        news_end_date.toISOString(),
      ]);
      console.log(callback.rows);
      const data = {
        news_list: callback.rows,
      };

      return response.success(data);
    } else {
      if (body.news_start_date == null && body.news_end_date == null) {

        const callback = await condb.clientQuery(queryNews.searchLike, [
          body.company_id,
          body.news_name || null,
          body.news_type_id || null,
          body.news_start_date || null,
          body.news_end_date || null,
        ]);
        console.log(callback.rows);
        const data = {
          news_list: callback.rows,
        };

        return response.success(data);
      } else {
        var news_start_date = new Date(body.news_start_date);
        news_start_date.setHours(7);
        console.log(news_start_date.toISOString())
        var news_end_date = new Date(body.news_end_date);
        news_end_date.setDate((news_end_date.getDate() + 1));
        news_end_date.setHours(6);
        news_end_date.setMinutes(59);
        news_end_date.setSeconds(59);
        console.log(news_end_date.toISOString())

        const callback = await condb.clientQuery(queryNews.searchLike, [
          body.company_id,
          body.news_name || null,
          body.news_type_id || null,
          news_start_date.toISOString(),
          news_end_date.toISOString(),
        ]);
        console.log(callback.rows);
        const data = {
          news_list: callback.rows,
        };

        return response.success(data);
      }
    }
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/filternews", [authenticateToken], filternews);

/**
 * Add News
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const add_news = async (req, res, next) => {
  const response = new Responsedata(req, res);
  const error_list = [];
  try {
    // const orm = new ormPg();
    const user_token = response.getPayloadData();
    const body = req.body;

    const chackNews = await condb.clientQuery(
      queryNews.chackNewsName, [
      body.news_name,
      body.company_id,
    ]);

    console.log(chackNews);

    if (chackNews.rows.length != 0) {
      return response.error([{
        errorcode: 400,
        errorDis: "มีชื่อซ้ำกับในระบบแล้ว!"
      }])
    }

    const id = uuidv4();

    const model = {
      news_name: body.news_name,
      news_start_date: body.news_start_date,
      news_end_date: body.news_end_date,
      news_detail: body.news_detail,
      news_news_type_id: body.news_type_id,
      news_is_use: true,
      news_create_by: user_token.fup,
      news_update_by: user_token.fup,
      news_img_name: body.news_image_name,
      news_img_path: body.news_image_path,
      news_company_id: body.company_id,
    };

    const callback = await condb.insert("news", model);

    return response.success({ news_id: id });
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/addnews", [authenticateToken], add_news);

/**
 * Get News
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const GetNews = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const { news_id } = req.body;

    const callback = await condb.findAll("news", {
      where: [
        { key: "news_is_use", value: true },
        { key: "news_id", value: news_id },
      ],
    });

    const data = {
      news_list: [],
    };

    for (const key in callback) {
      if (Object.hasOwnProperty.call(callback, key)) {
        const item = callback[key];

        const _data = {
          news_id: item.news_id,
          news_name: item.news_name,
          news_detail: item.news_detail,
          news_start_date: item.news_start_date,
          news_end_date: item.news_end_date,
          news_type_id: item.news_news_type_id,
          news_image_name: item.news_img_name,
          news_image_path: item.news_img_path,
        };
        data.news_list.push(_data);
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
router.post("/getnews", [authenticateToken], GetNews);
// router.post('/getthankpoint/:tp_id', [authenticateToken], GetThankPoint);

/**
 * Edit Award Point
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const EditNews = async (req, res, next) => {
  const response = new Responsedata(req, res);
  const error_list = [];
  try {
    // const orm = new ormPg();
    const user_token = response.getPayloadData();
    const body = req.body;

    const chackNews = await condb.clientQuery(
      queryNews.chackNewsNameByID, [
      body.news_name,
      body.company_id,
      body.news_id,
    ]);

    console.log(chackNews.rows);

    if (chackNews.rows.length != 0) {
      return response.error([{
        errorcode: 400,
        errorDis: "มีชื่อซ้ำกับในระบบแล้ว!"
      }])
    }

    const model = {
      news_name: body.news_name,
      news_detail: body.news_detail,
      news_type: body.news_type,
      news_start_date: body.news_start_date,
      news_end_date: body.news_end_date,
      news_update_date: new Date(),
      news_update_by: user_token.fup,
      news_img_name: body.news_image_name,
      news_img_path: body.news_image_path,
      news_company_id: body.company_id,
    };

    const callback = await condb.update("news", model, body.news_id);

    return response.success({ news_id: body.news_id });
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/editnews", [authenticateToken], EditNews);

/**
 * Delete Award Point
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const DeleteNews = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    // const orm = new ormPg();
    const user_token = response.getPayloadData();
    const { news_id } = req.params;

    const findData = await condb.findOne("news", {
      where: [
        { key: "news_is_use", value: true },
        { key: "news_id", value: news_id },
      ],
    });

    if (!findData) {
      return response.error([
        {
          errorcode: 400,
          errorDis: "ไม่พบข้อมูล",
        },
      ]);
    }

    const model = {
      news_is_use: false,
      news_update_date: new Date(),
      news_update_by: user_token.fup,
    };

    const callback = await condb.update("news", model, news_id);

    return response.success({ news_id: news_id });
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.get("/deletenews/:news_id", [authenticateToken], DeleteNews);

/**
* Get News List
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const GetNewsList = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    // console.log(body);
    const callback = await condb.clientQuery(queryNews.getNewsList, [
      body.company_id,
    ]);
    // console.log(callback.rows);

    const data = callback.rows;

    return response.success(data);
  } catch (error) {
    return response.error([{
      errorcode: 400,
      errorDis: error.message
    }])
  }
}
router.post('/getNewsList', [authenticateToken], GetNewsList);

module.exports = router;
