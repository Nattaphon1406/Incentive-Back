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
    console.log(body);
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
          [membership.rows[i].gm_emp_id, body.company_id, body.oem_id]
        );
        let liet = {
          membership_name: employee.rows[0].emp_name_th + (i + 1 != membership.rows.length ? ',' : ''),
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
    const group_id = req.body;
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
            [membership.rows[i].gm_emp_id, group_id.company_id, group_id.oem_id]
          );
          // console.log(employee.rows);
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
router.post("/getrManageGroupById", [authenticateToken], GetrManageGroup);

const GetUserGroup = async (req, res, next) => {
  const response = new Responsedata(req, res);
  try {
    const body = req.body;
    console.log(body.company_id,
      body.oem_id,
      body.emp_name_th || null,
      body.department || null,
      body.position || null,);

    const usertabel = await condb2.clientQuery(queryManageGroup.Usertabel, [
      body.company_id,
      body.oem_id,
      body.emp_name_th || null,
      body.department || null,
      body.position || null,
    ]);
    console.log(usertabel.rows, "dddd");
    const chack = await condb.clientQuery(queryManageGroup.chackuser);
    // console.log(chack.rows);
    // console.log(usertabel.rows);
    var tabeluser = [];
    for (let item of usertabel.rows) {
      var check = chack.rows.filter((e) => {
        return e.gm_emp_id === item.id;
      });
      if (check.length > 0) {
        var as = {
          id: item.id,
          membership_number: item.emp_no,
          membership_name: item.emp_name_th,
          department: item.dep_name,
          position: item.emp_position,
          chackuse: false,
        };
        tabeluser.push(as);
      } else {
        var as = {
          id: item.id,
          membership_number: item.emp_no,
          membership_name: item.emp_name_th,
          department: item.dep_name,
          position: item.emp_position,
          chackuse: true,
        };
        tabeluser.push(as);
      }
    }
    console.log(tabeluser, "test");

    return response.success(tabeluser);
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
    console.log(Group.rows);
    if (Group.rows.length > 0) {
      return response.error([{
        errorcode: 400,
        errorDis: "มีชื่อซ้ำกับในระบบแล้ว!"
      }])
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
    console.log(body);

    const GroupName = await condb.clientQuery(queryManageGroup.chackManageGroupNameById, [
      body.group_name,
      body.id
    ]);
    console.log(GroupName.rows);
    if (GroupName.rows.length > 0) {
      return response.error([{
        errorcode: 400,
        errorDis: "มีชื่อซ้ำกับในระบบแล้ว!"
      }])
    }

    var chacktabel = await condb.clientQuery(queryManageGroup.chackGroup, [
      body.id,
    ]);
    console.log(chacktabel.rows);
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

    const callback = await condb2.clientQuery(queryManageGroup.departmentlist, [
      body.company_id,
      body.oem_id,
    ]);

    const data = callback.rows;

    return response.success(data);
  } catch (error) {
    return response.error([{
      errorcode: 400,
      errorDis: error.message
    }])
  }
}
router.post('/departmentList', [authenticateToken], GetDepartmentList);

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
    return response.error([{
      errorcode: 400,
      errorDis: error.message
    }])
  }
}
router.post('/positionList', [authenticateToken], GetPositionList);

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
    const user_token = response.getPayloadData()
    const { mg_id } = req.params;


    const findData = await condb.findOne("manage_group", {
      where: [
        { key: "mg_is_use", value: true },
        { key: "mg_id", operators: "=", value: mg_id }
      ]
    });

    if (!findData) {
      return response.error([{
        errorcode: 400,
        errorDis: "ไม่พบข้อมูล"
      }])
    }

    const model = {
      mg_is_use: false,
      mg_update_date: new Date(),
    }

    const callback = await condb.update("manage_group", model, mg_id)


    return response.success({ mg_id: mg_id });
  } catch (error) {
    return response.error([{
      errorcode: 400,
      errorDis: error.message
    }])
  }
}
router.get('/deleteGroup/:mg_id', [authenticateToken], DeleteManageGroup);

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
    const { mg_id } = req.params;

    const findData = await condb.findOne("manage_group", {
      where: [
        { key: "mg_is_use", value: true },
        { key: "mg_id", operators: "=", value: mg_id }
      ]
    });

    var status;
    findData.mg_is_active == true ? status = false : status = true;

    const model = {
      mg_is_active: status,
      mg_update_date: new Date(),
    }

    const callback = await condb.update("manage_group", model, mg_id)

    return response.success({ mg_id: mg_id });
  } catch (error) {
    return response.error([{
      errorcode: 400,
      errorDis: error.message
    }])
  }
}
router.get('/changeStatusManageGroup/:mg_id', [authenticateToken], ChangeStatusCategory);


module.exports = router;
