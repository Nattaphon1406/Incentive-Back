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
const queryManageGroup = require("../query/queryManageGroup.json");
const queryGivePoint = require("../query/queryGivePoint.json");

/**
 * Filter Award Point History
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const FilterManageGroup = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    // console.log(body);
    const Group = await condb.clientQuery(queryManageGroup.filterManageGroup, [
      body.group_name,
    ]);
    // console.log(Group.rows);
    const ManageGroupliet = [];
    for (let index = 0; index < Group.rows.length; index++) {
      const membership = await condb.clientQuery(
        queryManageGroup.get_user_Group,
        [Group.rows[index].mg_id]
      );

      var num_membership = 0;
      const membershipliet = [];
      for (let i = 0; i < membership.rows.length; i++) {
        const employee = await condb2.clientQuery(
          queryManageGroup.get_employee_Group,
          [membership.rows[i].gm_emp_id]
        );

        let liet = {
          membership_name:
            employee.rows[0].emp_name_th +
            (i + 1 != membership.rows.length ? "," : ""),
        };
        membershipliet.push(liet);
        num_membership += 1;
      }

      let as = {
        id: Group.rows[index].mg_id,
        group_name: Group.rows[index].mg_group_name,
        member_ship: num_membership,
        member_list: membershipliet,
        group_description: Group.rows[index].mg_group_description,
        group_active: Group.rows[index].mg_is_active,
      };
      ManageGroupliet.push(as);
    }
    // console.log(ManageGroupliet);
    return response.success(ManageGroupliet);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/filterManageGroup", [authenticateToken], FilterManageGroup);

const GetrManageGroup = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const group_id = req.params;
    // console.log(group_id);
    const Group = await condb.clientQuery(queryManageGroup.getrManageGroup, [
      group_id.id,
    ]);
    // console.log(Group.rows);
    const ManageGroupliet = [];
    for (let index = 0; index < Group.rows.length; index++) {
      const membership = await condb.clientQuery(
        queryManageGroup.get_user_Group,
        [Group.rows[index].mg_id]
      );
      // console.log(membership.rows, "xxx");
      var membershipliet = [];
      if (membership.rows.length != 0) {
        for (let i = 0; i < membership.rows.length; i++) {
          const employee = await condb2.clientQuery(
            queryManageGroup.get_employee_Group,
            [membership.rows[i].gm_emp_id]
          );
          // console.log(employee);
          let liet = {
            id: employee.rows[0].id,
            membership_name: employee.rows[0].emp_name_th,
            membership_number: employee.rows[0].emp_no,
            department: employee.rows[0].dep_name,
            position: employee.rows[0].emp_position,
          };
          membershipliet.push(liet);
        }
      }
      let as = {
        id: Group.rows[index].mg_id,
        group_name: Group.rows[index].mg_group_name || "",
        group_description: Group.rows[index].mg_group_description || "",
        group_user: membershipliet,
      };
      ManageGroupliet.push(as);
    }
    /* console.log(ManageGroupliet); */
    return response.success(ManageGroupliet);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.get("/getrManageGroupById/:id", [authenticateToken], GetrManageGroup);

const GetUserGroup = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    // console.log(body.company_id, body.oem_id, body.department || null);

    const usertable = await condb2.clientQuery(queryGivePoint.Usertabel, [
      body.company_id,
      body.oem_id,
      body.department || null,
    ]);
    // console.log(usertable.rows, "dddd");
    const chack = await condb.clientQuery(queryGivePoint.chackuser);
    var tableuser = [];
    for (let item of usertable.rows) {
      var check = chack.rows.filter((e) => {
        return e.gm_emp_id === item.id;
      });
      if (check.length > 0) {
        var as = {
          id: item.id,
          membership_number: item.emp_no,
          membership_name: item.emp_name_th,
          department: item.dep_name,
          chackuse: false,
        };
        tableuser.push(as);
      } else {
        var as = {
          id: item.id,
          membership_number: item.emp_no,
          membership_name: item.emp_name_th,
          department: item.dep_name,
          chackuse: true,
        };
        tableuser.push(as);
      }
    }
    // console.log(tableuser, "test");

    return response.success(tableuser);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/getUsergroup", [authenticateToken], GetUserGroup);

const AddUserGroup = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    // console.log(body);
    const Group = await condb.clientQuery(queryManageGroup.chackManageGroup, [
      body.group_name,
    ]);
    // console.log(Group.rows);
    if (Group.rows.length > 0) {
      return response.error([
        {
          errorcode: 400,
          errorDis: "มีชื่อซ้ำกับในระบบแล้ว!",
        },
      ]);
    } else {
      let mg_id = uuidv4();
      await condb.clientQuery(queryManageGroup.addManageGroup, [
        mg_id,
        body.group_name,
        body.group_description,
        true,
        moment(new Date()),
        moment(new Date()),
        body.group_active,
      ]);
      var group = body.group_user;
      for (let index = 0; index < group.length; index++) {
        let gm_id = uuidv4();
        await condb.clientQuery(queryManageGroup.addgroupmember, [
          gm_id,
          group[index].id,
          mg_id,
          true,
          moment(new Date()),
          moment(new Date()),
        ]);
      }
    }

    return response.success(true);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/addUsergroup", [authenticateToken], AddUserGroup);

const EditUserGroup = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    // console.log(body);

    const GroupName = await condb.clientQuery(
      queryManageGroup.chackManageGroupNameById,
      [body.group_name, body.id]
    );
    // console.log(GroupName.rows);
    if (GroupName.rows.length > 0) {
      return response.error([
        {
          errorcode: 400,
          errorDis: "มีชื่อซ้ำกับในระบบแล้ว!",
        },
      ]);
    }

    var chacktabel = await condb.clientQuery(queryManageGroup.chackGroup, [
      body.id,
    ]);
    // console.log(chacktabel.rows);
    var addtabel = [];
    for (let i of body.group_user) {
      var check = chacktabel.rows.filter((e) => {
        return e.gm_emp_id === i.id;
      });
      if (check.length > 0) {
      } else {
        let as = {
          add_id: i.id,
        };
        addtabel.push(as);
        // console.log(as, "2");
      }
    }

    var deltabel = [];
    for (let i of chacktabel.rows) {
      var check = body.group_user.filter((e) => {
        return e.id === i.gm_emp_id;
      });
      // console.log(check);
      if (check.length > 0) {
      } else {
        let as = {
          del_id: i.gm_id,
        };
        deltabel.push(as);
        // console.log(as, "1");
      }
    }

    await condb.clientQuery(queryManageGroup.updateManageGroup, [
      body.id,
      body.group_name || "",
      body.group_description || "",
      moment(new Date()),
    ]);
    console.log("x");

    for (let i of addtabel) {
      let gm_id = uuidv4();
      await condb.clientQuery(queryManageGroup.addgroupmember, [
        gm_id,
        i.add_id,
        body.id,
        true,
        moment(new Date()),
        moment(new Date()),
      ]);
      /* console.log("xx"); */
    }
    for (let i of deltabel) {
      await condb.clientQuery(queryManageGroup.delusergroup, [i.del_id]);

      /* console.log("xxx"); */
    }

    return response.success(true);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/editUsergroup", [authenticateToken], EditUserGroup);

/**
 * Get Department list
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const GetDepartmentList = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    const ap_department = await condb.clientQuery(
      queryGivePoint.ap_department,
      [body.award_point_id]
    );
    const data = [];
    for (let index = 0; index < ap_department.rows.length; index++) {
      const callback = await condb2.clientQuery(queryGivePoint.departmentlist, [
        body.company_id,
        body.oem_id,
        ap_department.rows[index].dap_department_id,
      ]);
      for (let i = 0; i < callback.rows.length; i++) {
        let as = {
          id: callback.rows[i].id,
          dep_name: callback.rows[i].dep_name,
        };
        data.push(as);
      }
      console.log(data);
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
router.post("/departmentList", [authenticateToken], GetDepartmentList);

/**
 * Get Position list
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const GetPositionList = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;

    const callback = await condb2.clientQuery(queryManageGroup.positionlist, [
      body.company_id,
      body.oem_id,
    ]);

    const data = callback.rows;

    // const data = {
    //   position_list: [],
    // }

    // for (const key in callback) {
    //   if (Object.hasOwnProperty.call(callback, key)) {
    //     const item = callback[key];

    //     const _data = {
    //       position_name: item.emp_position || null,
    //     }
    //     data.position_list.push(_data)
    //   }
    // }

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
router.post("/positionList", [authenticateToken], GetPositionList);

/**
 * Delete Manage Group
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const DeleteManageGroup = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    // const orm = new ormPg();
    const user_token = response.getPayloadData();
    const { mg_id } = req.params;

    const findData = await condb.findOne("manage_group", {
      where: [
        { key: "mg_is_use", value: true },
        { key: "mg_id", operators: "=", value: mg_id },
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
      mg_is_use: false,
      mg_update_date: new Date(),
    };

    const callback = await condb.update("manage_group", model, mg_id);

    return response.success({ mg_id: mg_id });
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.get("/deleteGroup/:mg_id", [authenticateToken], DeleteManageGroup);

/**
 * Change Manage Group Product
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const ChangeStatusCategory = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const user_token = response.getPayloadData();
    const { mg_id } = req.params;

    const findData = await condb.findOne("manage_group", {
      where: [
        { key: "mg_is_use", value: true },
        { key: "mg_id", operators: "=", value: mg_id },
      ],
    });

    var status;
    findData.mg_is_active == true ? (status = false) : (status = true);

    const model = {
      mg_is_active: status,
      mg_update_date: new Date(),
    };

    const callback = await condb.update("manage_group", model, mg_id);

    return response.success({ mg_id: mg_id });
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
  "/changeStatusManageGroup/:mg_id",
  [authenticateToken],
  ChangeStatusCategory
);

/**
 * GetGroupList
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

const GetGroupList = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    const callback = await condb.clientQuery(queryGivePoint.GetGroupList);
    const data = callback.rows;
    // console.log(data);
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
router.post("/getgrouplist", [authenticateToken], GetGroupList);

const AddGivePoint = async (req, res, next) => {
  const response = new Responsedata(req, res);
  const error_list = [];
  try {
    // const orm = new ormPg();
    const user_token = response.getPayloadData();
    const body = req.body;

    if (error_list.length > 0) {
      return response.error(error_list);
    }

    const findData = await condb.findOne("give_point", {
      where: [{ key: "gp_id", value: body.gp_id }],
    });

    if (findData) {
      return response.error([
        {
          errorcode: 400,
          errorDis: "มี ID หรือชื่อซ้ำกับระบบแล้ว",
        },
      ]);
    }

    var emp = body.emp;
    console.log("emp length", emp.length);
    for (let index = 0; index < emp.length; index++) {
      console.log("emp5555", emp);
      console.log("emp length", emp.length);
      let gp_id = uuidv4();
      await condb.clientQuery(queryGivePoint.AddGivePoint, [
        gp_id,
        body.award_point_id,
        emp[index].id,
        body.remark,
        true,
        moment(new Date()),
        user_token.fup,
        moment(new Date()),
        user_token.fup,
      ]);
    }

    for (let index = 0; index < emp.length; index++) {
      console.log("emp5555", emp);
      console.log("emp length", emp.length);
      let gp_id = uuidv4();
      await condb.clientQuery(queryGivePoint.UpdateEmployeePoint, [
        emp[index].id,
        moment(new Date()),
        body.point,
      ]);
    }
    return response.success(true);
  } catch (error) {
    return response.error([
      {
        errorcode: 400,
        errorDis: error.message,
      },
    ]);
  }
};
router.post("/addgivepoint", [authenticateToken], AddGivePoint);

/**
 * filter group employee
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const filterGroupEmployee = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    console.log("body.group_id", body.group_id);
    const group_member_data = await condb.clientQuery(
      queryGivePoint.group_member,
      [body.group_id]
    );

    const data = [];
    console.log("group", group_member_data.rows);
    for (let index = 0; index < group_member_data.rows.length; index++) {
      const employee_data = await condb2.clientQuery(queryGivePoint.employee, [
        group_member_data.rows[index].gm_emp_id,
      ]);
      for (let index2 = 0; index2 < employee_data.rows.length; index2++) {
        const department_data = await condb2.clientQuery(
          queryGivePoint.departmentlist,
          [
            body.company_id,
            body.oem_id,
            employee_data.rows[index2].department_id,
          ]
        );
        for (let index3 = 0; index3 < department_data.rows.length; index3++) {
          let as = {
            id: employee_data.rows[index2].id,
            membership_number: employee_data.rows[index2].emp_no,
            membership_name: employee_data.rows[index2].emp_name_th,
            department: department_data.rows[index3].dep_name,
          };
          data.push(as);
        }
        // console.log("department_data"+employee_data.rows[index2].emp_name_th,department_data.rows)
      }
    }
    console.log("group_data", data);
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
router.post("/filtergroupemployee", [authenticateToken], filterGroupEmployee);

/**
 * filter department employee
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const filterDepartmentEmployee = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    console.log("body555", body.department_id_list);

    var id_list = body.department_id_list;
    const data = [];
    console.log("length", id_list.length);
    for (let index = 0; index < id_list.length; index++) {
      const department_member_data = await condb2.clientQuery(
        queryGivePoint.employee_dep,
        [id_list[index].id]
      );
      for (
        let index2 = 0;
        index2 < department_member_data.rows.length;
        index2++
      ) {
        let as = {
          id: department_member_data.rows[index2].id,
          membership_number: department_member_data.rows[index2].emp_no,
          membership_name: department_member_data.rows[index2].emp_name_th,
          department: id_list[index].dep_name,
        };
        data.push(as);
      }
      console.log("department_member_data", department_member_data.rows);
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
router.post(
  "/filterdepartmentemployee",
  [authenticateToken],
  filterDepartmentEmployee
);

/**
 * filter department employee
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const CheckBudgetLimit = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;

    const current_year = new Date().getFullYear();
    console.log("current_year", current_year);
    const BudgetSum = await condb.clientQuery(queryGivePoint.SelectBudgetSum, [
      current_year,
    ]);

    const TotalPointSum = await condb.clientQuery(
      queryGivePoint.SelectGivepointSum,
      []
    );
    console.log("BudgetSum.rows.sum_budget_amount", BudgetSum.rows[0].sum);
    console.log("TotalPointSum", TotalPointSum.rows);
    var total_point = 0
    for (let index = 0; index < TotalPointSum.rows.length; index++) {
      total_point += parseInt(TotalPointSum.rows[index].total) 
    }
    console.log("total_point", total_point);
    const PointAward = await condb.clientQuery(
      queryGivePoint.SelectAwardPoint,
      [body.company_id, body.ap_id || null]
    );
    console.log("PointAward.rows.ap_point", PointAward.rows);
    console.log("PointAward.rows.ap_point", PointAward.rows[0].ap_point);

    let data = {
      Budget: parseFloat(BudgetSum.rows[0].sum) ,
      Point: parseInt(PointAward.rows[0].ap_point) ,
      Total_point: total_point
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
router.post("/checkbudgetlimit", [authenticateToken], CheckBudgetLimit);
module.exports = router;
