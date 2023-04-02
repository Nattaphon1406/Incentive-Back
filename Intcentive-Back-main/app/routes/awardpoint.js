const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const Responsedata = require("../middleware/response");
const { v4: uuidv4 } = require("uuid");
// const ormPg = require('../lib/ormPg');
const databaseContextPg = require("database-context-pg");
const systemService = require("../lib/api/system");
const vehicleService = require("../lib/api/vehicle");
const { isArray, isNumber, isPlainObject } = require("lodash");
const moment = require("moment");

const router = express.Router();

const connectionSetting = require("../dbconnect");
const padZero = require("../lib/padZero");
const permissionService = require("../lib/api/permission");
const connectionConfig = connectionSetting.config;
const condb = new databaseContextPg(connectionConfig);
const connectionConfig2 = connectionSetting.config2;
const condb2 = new databaseContextPg(connectionConfig2);
const queryAwardPoint = require("../query/queryAwardPoint");
const queryDepartment = require("../query/queryDepartment");

/**
 * Filter Award Point Part
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

const filterAwardPoint = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;

    const _where = {
      where: [{ key: "ap_is_use", value: true }],
    };

    if (body.company_id != "" && body.company_id) {
      _where.where.push({ key: "ap_company_id", value: body.company_id });
    }

    const callback = await condb.clientQuery(queryAwardPoint.searchLike, [
      body.company_id,
      body.ap_point_id || null,
      body.ap_point_name || null,
      body.ap_point_min || 0,
      body.ap_point_max || 9999999,
    ]);

    const data = {
      award_point_list: callback.rows,
    };

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
router.post("/filterAwardPoint", [authenticateToken], filterAwardPoint);

/**
 * Add Award Point
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const AddAwardPoint = async (req, res, next) => {
  const response = new Responsedata(req, res);
  const error_list = [];
  try {
    // const orm = new ormPg();
    const user_token = response.getPayloadData();
    const body = req.body;

    const findCheckId = await condb.clientQuery(
      queryAwardPoint.checkAwardPointID,
      [body.ap_point_id]
    );

    const findCheckName = await condb.clientQuery(
      queryAwardPoint.checkAwardPointName,
      [body.ap_point_name, body.company_id]
    );

    console.log(findCheckId.rows.length, findCheckName.rows.length);
    if (findCheckId.rows.length != 0 || findCheckName.rows.length != 0) {
      return response.error([
        {
          errorcode: 400,
          errorDis: "มี ID หรือชื่อซ้ำกับในระบบแล้ว!",
        },
      ]);
    }

    const id = uuidv4();
    const model = {
      ap_id: id,
      ap_point_id: body.ap_point_id,
      ap_point_name: body.ap_point_name,
      ap_point: body.ap_point,
      ap_point_detail: body.ap_point_detail,
      ap_company_id: body.company_id,
      ap_image_name: body.ap_image_name,
      ap_image_path: body.ap_image_path,
      ap_is_active: body.ap_is_active,
      ap_is_use: true,
      ap_create_by: user_token.fup,
      ap_update_by: user_token.fup,
      ap_oem_id: body.oem_id,
      ap_is_active: true,
    };
    console.log(model);
    const callback = await condb.insert("award_point", model);
    // const dap_id = uuidv4()
    if (body.dap_department_id.length > 0) {
      await body.dap_department_id.forEach(async (element) => {
        const dap_model = {
          dap_department_id: element,
          dap_award_point_id: id,
          dap_is_use: true,
        };
        const dap_callback = await condb.insert(
          "department_award_point",
          dap_model
        );
      });
    }
    return response.success({ ap_id: id });
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/addawardpoint", [authenticateToken], AddAwardPoint);

/**
 * Get Award Point
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const GetAwardPoint = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const { ap_id } = req.body;

    const callback = await condb.findAll("award_point", {
      where: [
        { key: "ap_is_use", value: true },
        { key: "ap_id", value: ap_id },
      ],
    });

    const data = {
      award_point_list: [],
    };
    for (const key in callback) {
      if (Object.hasOwnProperty.call(callback, key)) {
        const item = callback[key];
        const dap_callback = await condb.findAll("department_award_point", {
          where: [
            { key: "dap_is_use", value: true },
            { key: "dap_award_point_id", value: item.ap_id },
          ],
        });
        const dap_data = [];
        const dap_id = [];
        for (const key in dap_callback) {
          if (Object.hasOwnProperty.call(dap_callback, key)) {
            const element = dap_callback[key];
            dap_data.push(element.dap_department_id);
          }
        }
        for (const key in dap_callback) {
          if (Object.hasOwnProperty.call(dap_callback, key)) {
            const element = dap_callback[key];
            dap_id.push(element.dap_id);
          }
        }
        console.log("dap_data", dap_data);
        const _data = {
          ap_id: item.ap_id,
          ap_point_id: item.ap_point_id,
          ap_point_name: item.ap_point_name,
          ap_point: item.ap_point,
          ap_point_detail: item.ap_point_detail,
          ap_image_name: item.ap_image_name,
          ap_image_path: item.ap_image_path,
          ap_dap_id_list: dap_data,
          dap_id: dap_id,
        };
        data.award_point_list.push(_data);
      }
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
router.post("/getawardpoint", [authenticateToken], GetAwardPoint);
// router.post('/getthankpoint/:ap_id', [authenticateToken], GetThankPoint);

/**
 * Edit Award Point
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const EditAwardPoint = async (req, res, next) => {
  const response = new Responsedata(req, res);
  const error_list = [];
  try {
    // const orm = new ormPg();
    const user_token = response.getPayloadData();
    const body = req.body;

    const findCheckId = await condb.clientQuery(
      queryAwardPoint.checkAwardPointIdByID, [
      body.ap_point_id,
      body.ap_id,
  ]);

  const findCheckName = await condb.clientQuery(
    queryAwardPoint.checkAwardPointNameByID, [
      body.ap_point_name,
      body.ap_id,
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
      ap_point_id: body.ap_point_id,
      ap_point_name: body.ap_point_name,
      ap_point: body.ap_point,
      ap_point_detail: body.ap_point_detail,
      ap_image_name: body.ap_image_name,
      ap_image_path: body.ap_image_path,
      ap_update_date: new Date(),
      ap_update_by: user_token.fup,
    };

    const callback = await condb.update("award_point", model, body.ap_id);
    // const dap_callback = await condb.delete("department_award_point", model, body.ap_id)
    console.log(body.ap_id);
    const del_dap_callback = await condb.clientQuery(
      queryAwardPoint.DeleteDap,
      [body.ap_id]
    );
    if (body.dap_department_id.length > 0) {
      await body.dap_department_id.forEach(async (element) => {
        const dap_model = {
          dap_department_id: element,
          dap_award_point_id: body.ap_id,
          dap_is_use: true,
        };
        const dap_callback = await condb.insert(
          "department_award_point",
          dap_model
        );
      });
    }
    return response.success({ ap_id: body.ap_id });
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/editawardpoint", [authenticateToken], EditAwardPoint);

/**
 * Delete Award Point
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const DeleteAwardPoint = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    // const orm = new ormPg();
    const user_token = response.getPayloadData();
    const { ap_id } = req.params;

    const findData = await condb.findOne("award_point", {
      where: [
        { key: "ap_is_use", value: true },
        { key: "ap_id", operators: "=", value: ap_id },
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
      ap_is_use: false,
      ap_update_date: new Date(),
      ap_update_by: user_token.fup,
    };

    const callback = await condb.update("award_point", model, ap_id);
    return response.success({ ap_id: ap_id });
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.get("/deleteawardpoint/:ap_id", [authenticateToken], DeleteAwardPoint);

/**
 * Department LV1
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

const GetDepartmentLv1 = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    const callback = await condb2.clientQuery(
      queryDepartment.DepartmentLv1List,
      [body.company_id, body.oem_id]
    );

    const data = callback.rows;

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
router.post("/getdepartmentlv1", [authenticateToken], GetDepartmentLv1);

/**
 * Department LV2
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

const GetDepartmentLv2 = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    console.log(body);
    const callback = await condb2.clientQuery(
      queryDepartment.DepartmentLv2List,
      [body.parent_id]
    );

    const data = callback.rows;

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
router.post("/getdepartmentlv2", [authenticateToken], GetDepartmentLv2);

/**
 * Department LV1
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

const GetDepartmentList = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    const callback = await condb2.clientQuery(queryDepartment.DepartmentList, [
      body.company_id,
      body.oem_id,
    ]);

    const data = callback.rows;

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
router.post("/getdepartmentlist", [authenticateToken], GetDepartmentList);

/**
 * Change Award point
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const ChangeStatusAwardPoint = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const user_token = response.getPayloadData();
    const { ap_id } = req.params;
    console.log(ap_id);

    const findData = await condb.findOne("award_point", {
      where: [
        { key: "ap_is_use", value: true },
        { key: "ap_id", operators: "=", value: ap_id },
      ],
    });
    // console.log(findData.rows);
    var status;
    findData.ap_is_active == true ? (status = false) : (status = true);

    const model = {
      ap_is_active: status,
      ap_update_date: new Date(),
    };
    const callback = await condb.update("award_point", model, ap_id);

    return response.success({ ap_id: ap_id });
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.get(
  "/changeStatusAwardPoint/:ap_id",
  [authenticateToken],
  ChangeStatusAwardPoint
);

/**
 * Get Award point list
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const GetAwardPointList = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    console.log("Com", body.company_id);
    console.log("Body", body.oem_id);
    const callback = await condb.clientQuery(
      queryAwardPoint.GetAwardPointList,
      [body.company_id, body.oem_id]
    );

    const data = callback.rows;
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
router.post("/getawardpointList", [authenticateToken], GetAwardPointList);
module.exports = router;
