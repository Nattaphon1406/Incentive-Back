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
const condb2 = new databaseContextPg(connectionConfig2);

const queryPointHistory = require('../query/queryPointHistory.json');

/**
* Filter Award Point History
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const FilterAwardPointHistory = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const body = req.body;
        console.log(body);

        if (body.gp_date_from != null && body.gp_date_to != null) {

            var date_from = new Date(body.gp_date_from);
            date_from.setHours(7);
            console.log(date_from.toISOString());
            var date_to = new Date(body.gp_date_to);
            date_to.setDate((date_to.getDate() + 1));
            date_to.setHours(6);
            date_to.setMinutes(59);
            date_to.setSeconds(59);
            console.log(date_to.toISOString());

            const callback = await condb.clientQuery(
                queryPointHistory.searchAwardPointLike,
                [
                    body.company_id,
                    body.ap_point_id || null,
                    body.ap_point_name || null,
                    date_from.toISOString(),
                    date_to.toISOString(),
                ]);
            console.log("1", callback.rows);

            const data = {
                point_history_list: callback.rows
            }

            return response.success(data);
        } else if (body.gp_date_from != null && body.gp_date_to == null) {

            var date_from = new Date(body.gp_date_from);
            date_from.setHours(7);
            console.log(date_from.toISOString());

            const endDate = await condb.clientQuery(
                queryPointHistory.searchAwardPointDateMax,
                [
                    body.company_id,
                ]);
            console.log("end date", endDate.rows[0].max_date);

            var date_to = new Date(endDate.rows[0].max_date);
            date_to.setHours(16);
            console.log("date_to", date_to.toISOString());

            const callback = await condb.clientQuery(
                queryPointHistory.searchAwardPointLike,
                [
                    body.company_id,
                    body.ap_point_id || null,
                    body.ap_point_name || null,
                    date_from.toISOString(),
                    date_to.toISOString(),
                ]);
            console.log("1", callback.rows);

            const data = {
                point_history_list: callback.rows
            }

            return response.success(data);
        } else if (body.gp_date_from == null && body.gp_date_to != null) {

            var date_to = new Date(body.gp_date_to);
            date_to.setDate((date_to.getDate() + 1));
            date_to.setHours(6);
            date_to.setMinutes(59);
            date_to.setSeconds(59);
            console.log(date_to.toISOString());

            const startDate = await condb.clientQuery(
                queryPointHistory.searchAwardPointDateMin,
                [
                    body.company_id,
                ]);
            console.log("start date", startDate.rows[0].min_date);


            var date_from = new Date(startDate.rows[0].min_date);
            date_from.setHours(16);
            console.log("date_from", date_from.toISOString());

            const callback = await condb.clientQuery(
                queryPointHistory.searchAwardPointLike,
                [
                    body.company_id,
                    body.ap_point_id || null,
                    body.ap_point_name || null,
                    date_from.toISOString(),
                    date_to.toISOString(),
                ]);
            console.log("1", callback.rows);

            const data = {
                point_history_list: callback.rows
            }

            return response.success(data);
        } else {
            const callback = await condb.clientQuery(
                queryPointHistory.searchAwardPointDateNull,
                [
                    body.company_id,
                    body.ap_point_id || null,
                    body.ap_point_name || null,
                ]);
            console.log("2", callback.rows);

            // const GroupAwardliet = [];
            // for (let index = 0; index < callback.rows.length; index++) {
            //     const userData = await condb2.clientQuery(
            //         queryPointHistory.getUserByID,
            //         [callback.rows[index].gp_emp_id]
            //     );
            //     var list = {
            //         ap_point_id: callback.rows[index].ap_point_id,
            //         ap_point_name: callback.rows[index].ap_point_name,
            //         ap_point: callback.rows[index].ap_point,
            //         date: callback.rows[index].date,
            //         gp_remark: callback.rows[index].gp_remark,
            //         emp_name_th: userData.rows[0].emp_name_th,
            //     }
            //     GroupAwardliet.push(list);
            // }

            const data = {
                point_history_list: callback.rows
                // point_history_list: GroupAwardliet
            }

            return response.success(data);
        }
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/filterAwardPointHistory', [authenticateToken], FilterAwardPointHistory);

/**
* Filter User Award Point History
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const FilterAwardPointHistoryByUser = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const body = req.body;
        console.log(body);

        const userAward = await condb2.clientQuery(
            queryPointHistory.searchUser,
            [
                body.user_receive_point,
            ]);

        if (userAward.rows.length != 0) {
            if (body.gp_date_from != null && body.gp_date_to != null) {

                var date_from = new Date(body.gp_date_from);
                date_from.setHours(7);
                console.log(date_from.toISOString());
                var date_to = new Date(body.gp_date_to);
                date_to.setDate((date_to.getDate() + 1));
                date_to.setHours(6);
                date_to.setMinutes(59);
                date_to.setSeconds(59);
                console.log(date_to.toISOString());

                const GroupAwardliet = [];
                const UserList = [];
                for (var i = 0; i < userAward.rows.length; i++) {
                    const callback = await condb.clientQuery(
                        queryPointHistory.searchAwardPointLikeByUser,
                        [
                            body.company_id,
                            body.ap_point_id || null,
                            body.ap_point_name || null,
                            date_from.toISOString(),
                            date_to.toISOString(),
                            userAward.rows[i].id,
                        ]);
                    for (var j = 0; j < callback.rows.length; j++) {
                        var list = {
                            ap_point_id: callback.rows[j].ap_point_id,
                            ap_point_name: callback.rows[j].ap_point_name,
                            ap_point: callback.rows[j].ap_point,
                            date: callback.rows[j].date,
                            gp_remark: callback.rows[j].gp_remark,
                            gp_emp_id: callback.rows[j].gp_emp_id,
                        }
                        var user_list = {
                            id: userAward.rows[i].id,
                            emp_name_th: userAward.rows[i].emp_name_th,
                        }
                        UserList.push(user_list);
                        GroupAwardliet.push(list);
                    }
                }
                const data = {
                    point_history_list: GroupAwardliet,
                    user_list: UserList,
                }
                return response.success(data);
            } else if (body.gp_date_from != null && body.gp_date_to == null) {

                var date_from = new Date(body.gp_date_from);
                date_from.setHours(7);
                console.log(date_from.toISOString());

                const endDate = await condb.clientQuery(
                    queryPointHistory.searchAwardPointDateMax,
                    [
                        body.company_id,
                    ]);
                console.log("end date", endDate.rows[0].max_date);

                var date_to = new Date(endDate.rows[0].max_date);
                date_to.setHours(16);
                console.log("date_to", date_to.toISOString());

                const GroupAwardliet = [];
                const UserList = [];
                for (var i = 0; i < userAward.rows.length; i++) {
                    const callback = await condb.clientQuery(
                        queryPointHistory.searchAwardPointLikeByUser,
                        [
                            body.company_id,
                            body.ap_point_id || null,
                            body.ap_point_name || null,
                            date_from.toISOString(),
                            date_to.toISOString(),
                            userAward.rows[i].id,
                        ]);
                    for (var j = 0; j < callback.rows.length; j++) {
                        var list = {
                            ap_point_id: callback.rows[j].ap_point_id,
                            ap_point_name: callback.rows[j].ap_point_name,
                            ap_point: callback.rows[j].ap_point,
                            date: callback.rows[j].date,
                            gp_remark: callback.rows[j].gp_remark,
                            gp_emp_id: callback.rows[j].gp_emp_id,
                        }
                        var user_list = {
                            id: userAward.rows[i].id,
                            emp_name_th: userAward.rows[i].emp_name_th,
                        }
                        UserList.push(user_list);
                        GroupAwardliet.push(list);
                    }
                }
                const data = {
                    point_history_list: GroupAwardliet,
                    user_list: UserList,
                }

                return response.success(data);
            } else if (body.gp_date_from == null && body.gp_date_to != null) {

                var date_to = new Date(body.gp_date_to);
                date_to.setDate((date_to.getDate() + 1));
                date_to.setHours(6);
                date_to.setMinutes(59);
                date_to.setSeconds(59);
                console.log(date_to.toISOString());

                const startDate = await condb.clientQuery(
                    queryPointHistory.searchAwardPointDateMin,
                    [
                        body.company_id,
                    ]);
                console.log("start date", startDate.rows[0].min_date);


                var date_from = new Date(startDate.rows[0].min_date);
                date_from.setHours(16);
                console.log("date_from", date_from.toISOString());

                const GroupAwardliet = [];
                const UserList = [];
                for (var i = 0; i < userAward.rows.length; i++) {
                    const callback = await condb.clientQuery(
                        queryPointHistory.searchAwardPointLikeByUser,
                        [
                            body.company_id,
                            body.ap_point_id || null,
                            body.ap_point_name || null,
                            date_from.toISOString(),
                            date_to.toISOString(),
                            userAward.rows[i].id,
                        ]);
                    for (var j = 0; j < callback.rows.length; j++) {
                        var list = {
                            ap_point_id: callback.rows[j].ap_point_id,
                            ap_point_name: callback.rows[j].ap_point_name,
                            ap_point: callback.rows[j].ap_point,
                            date: callback.rows[j].date,
                            gp_remark: callback.rows[j].gp_remark,
                            gp_emp_id: callback.rows[j].gp_emp_id,
                        }
                        var user_list = {
                            id: userAward.rows[i].id,
                            emp_name_th: userAward.rows[i].emp_name_th,
                        }
                        UserList.push(user_list);
                        GroupAwardliet.push(list);
                    }
                }
                const data = {
                    point_history_list: GroupAwardliet,
                    user_list: UserList,
                }

                return response.success(data);
            } else {
                const GroupAwardliet = [];
                const UserList = [];
                for (var i = 0; i < userAward.rows.length; i++) {
                    const callback = await condb.clientQuery(
                        queryPointHistory.searchAwardPointDateNullByUser,
                        [
                            body.company_id,
                            body.ap_point_id || null,
                            body.ap_point_name || null,
                            userAward.rows[i].id,
                        ]);
                    for (var j = 0; j < callback.rows.length; j++) {
                        var list = {
                            ap_point_id: callback.rows[j].ap_point_id,
                            ap_point_name: callback.rows[j].ap_point_name,
                            ap_point: callback.rows[j].ap_point,
                            date: callback.rows[j].date,
                            gp_remark: callback.rows[j].gp_remark,
                            gp_emp_id: callback.rows[j].gp_emp_id,
                        }
                        var user_list = {
                            id: userAward.rows[i].id,
                            emp_name_th: userAward.rows[i].emp_name_th,
                        }
                        UserList.push(user_list);
                        GroupAwardliet.push(list);
                    }
                }
                const data = {
                    point_history_list: GroupAwardliet,
                    user_list: UserList,
                }
                return response.success(data);
            }
        } else {
            const data = {
                point_history_list: [],
                user_list: [],
            }
            return response.success(data);
        }
    } catch (error) {
        console.log("test error", error.message);
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/filterAwardPointHistoryByUser', [authenticateToken], FilterAwardPointHistoryByUser);

/**
* Filter Thank Point History
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
const FilterThankPointHistory = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const body = req.body;

        if (body.tph_date_from != null && body.tph_date_to != null) {

            var date_from = new Date(body.tph_date_from);
            date_from.setHours(7);
            console.log(date_from.toISOString());
            var date_to = new Date(body.tph_date_to);
            date_to.setDate((date_to.getDate() + 1));
            date_to.setHours(6);
            date_to.setMinutes(59);
            date_to.setSeconds(59);
            console.log(date_to.toISOString());

            const callback = await condb.clientQuery(
                queryPointHistory.searchThankPointLike,
                [
                    body.company_id,
                    body.tp_point_id || null,
                    body.tp_point_name || null,
                    date_from.toISOString(),
                    date_to.toISOString(),
                    body.user_give_point || null,
                    body.user_receive_point || null,
                ]);

            const data = {
                point_history_list: callback.rows
            }

            return response.success(data);
        } else if (body.tph_date_from != null && body.tph_date_to == null) {

            var date_from = new Date(body.tph_date_from);
            date_from.setHours(7);
            console.log(date_from.toISOString());

            const endDate = await condb.clientQuery(
                queryPointHistory.searchThankPointDateMax,
                [
                    body.company_id,
                ]);
            console.log("end date", endDate.rows[0].max_date);

            var date_to = new Date(endDate.rows[0].max_date);
            date_to.setHours(16);
            console.log("date_to", date_to.toISOString());

            const callback = await condb.clientQuery(
                queryPointHistory.searchThankPointLike,
                [
                    body.company_id,
                    body.tp_point_id || null,
                    body.tp_point_name || null,
                    date_from.toISOString(),
                    date_to.toISOString(),
                    body.user_give_point || null,
                    body.user_receive_point || null,
                ]);
            console.log(callback.rows);

            const data = {
                point_history_list: callback.rows
            }

            return response.success(data);
        } else if (body.tph_date_from == null && body.tph_date_to != null) {

            var date_to = new Date(body.tph_date_to);
            date_to.setDate((date_to.getDate() + 1));
            date_to.setHours(6);
            date_to.setMinutes(59);
            date_to.setSeconds(59);
            console.log(date_to.toISOString());

            const startDate = await condb.clientQuery(
                queryPointHistory.searchThankPointDateMin,
                [
                    body.company_id,
                ]);
            console.log("start date", startDate.rows[0].min_date);


            var date_from = new Date(startDate.rows[0].min_date);
            date_from.setHours(16);
            console.log("date_from", date_from.toISOString());

            const callback = await condb.clientQuery(
                queryPointHistory.searchThankPointLike,
                [
                    body.company_id,
                    body.tp_point_id || null,
                    body.tp_point_name || null,
                    date_from.toISOString(),
                    date_to.toISOString(),
                    body.user_give_point || null,
                    body.user_receive_point || null,
                ]);
            console.log(callback.rows);

            const data = {
                point_history_list: callback.rows
            }

            return response.success(data);
        } else {
            const callback = await condb.clientQuery(
                queryPointHistory.searchThankPointDateNull,
                [
                    body.company_id,
                    body.tp_point_id || null,
                    body.tp_point_name || null,
                    body.user_give_point || null,
                    body.user_receive_point || null,
                ]);

            const data = {
                point_history_list: callback.rows
            }

            return response.success(data);

        }
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/filterThankPointHistory', [authenticateToken], FilterThankPointHistory);



module.exports = router;
