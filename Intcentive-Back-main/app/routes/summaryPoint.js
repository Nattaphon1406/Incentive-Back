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
const queryAwardPoint = require('../query/queryAwardPoint');
const queryDepartment = require('../query/queryDepartment');

const querySummaryPoint = require('../query/querySummaryPoint.json');

/**
* Filter Award Point Part
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/

const filterSummaryPoint = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const body = req.body;
        if (!body.company_id || body.company_id == "") {
            throw Error("company_id not found!!!");
        }
        var department_list = await condb2.clientQuery(querySummaryPoint.getDepartmentByCom,[body.company_id,body.department_id || null]);
      /*   console.log(department_list.rows) */
        var department_listSummary = await condb2.clientQuery(querySummaryPoint.getDepartmentByCom,[body.company_id, null]);

        //no chart
        var total_point = await condb.clientQuery(querySummaryPoint.getTotalPoint, [body.start_date,body.end_date]);
        console.log("moment(body.start_date).format('YYYY')",moment(body.start_date).format('YYYY'))
        var budget_point = await condb.clientQuery(querySummaryPoint.getComapnyBudgetPoint, [body.company_id,moment(body.start_date).format('YYYY')]);

        var award_point_transection = await condb.clientQuery(querySummaryPoint.getAwardTransection, [body.start_date,body.end_date]);

        var thank_point_transection = await condb.clientQuery(querySummaryPoint.getThankTransection, [body.start_date,body.end_date]);
        // console.log("thank_point_transection.rows",thank_point_transection.rows)

        var redeem_point_transection = await condb.clientQuery(querySummaryPoint.getRedeemTransection, [body.start_date,body.end_date]);

  /*       var redeem_point = await condb.clientQuery(querySummaryPoint.getSumRedeemPoint, [body.company_id]); */
        
        // chart
        var award_point_data  = await condb.clientQuery(querySummaryPoint.getAwardPointData,[body.start_date,body.end_date]);
  
        var user_point_data = await condb.clientQuery(querySummaryPoint.getUserPointData,[]);

        var redeem_point_data = await condb.clientQuery(querySummaryPoint.getRedeemPointData,[body.start_date,body.end_date]);
   
        var thank_point_data = await condb.clientQuery(querySummaryPoint.getThankPointData,[body.start_date,body.end_date]);
        
        var category_data = await condb.clientQuery(querySummaryPoint.getCategoryData,[body.start_date,body.end_date]);

        var budget_year_data = await condb.clientQuery(querySummaryPoint.getBudgetYearData,[body.company_id,parseInt(moment(new Date()).format('YYYY'))])
        console.log("budget_year_data",budget_year_data.rows)
      

        var total_point_data = 0;
        var award_tran_data = 0;
        var thank_tran_data = 0;
        var redeem_tran_data = 0
        var total_redeem_point_data = 0

        var summary_department_set =[];
        var award_point_data_set = [];
        var user_point_data_set = [];
        var redeem_point_data_set = [];
        var thank_point_data_set = [];
        var category_point_data_set = [];

        for(let i of department_listSummary.rows){
            var emp_list = await condb2.clientQuery(querySummaryPoint.getEmpListByDepartment,[i.id]);   
            for(let item2 of emp_list.rows){
                var emp_user = user_point_data.rows.filter((e)=> {return e.emp_id === item2.id});
                for(let item of emp_user){
                    item.department = i.dep_name;
                    summary_department_set.push(item);
                }
            }
        }

        for(let item of department_list.rows){

            var emp_list = await condb2.clientQuery(querySummaryPoint.getEmpListByDepartment,[item.id]);   
           /*  console.log(emp_list.rows) */
            for(let item2 of emp_list.rows){

                var emp_total_point = total_point.rows.filter((e)=> {return e.emp_id === item2.id});
                for(let item_total of emp_total_point){
                    total_point_data += parseInt(item_total.point || 0);
                }

                var emp_award_point_tran = award_point_transection.rows.filter((e)=> {return e.emp_id === item2.id});
                for(let item of emp_award_point_tran){
                    award_tran_data += 1;
                }

                // console.log("thank_point_transection.rows",thank_point_transection.rows)
                var emp_thank_point_tran = thank_point_transection.rows.filter((e)=> {return e.emp_id === item2.id});
                for(let item of emp_thank_point_tran){
                    thank_tran_data += 1;
                }

                var emp_redeem_point_tran = redeem_point_transection.rows.filter((e)=> {return e.emp_id === item2.id});
                for(let item of emp_redeem_point_tran){
                    redeem_tran_data += 1;
                    total_redeem_point_data += parseInt(item.point || 0);
                }
      
                var emp_award = award_point_data.rows.filter((e)=> {return e.emp_id === item2.id});
                for(let item_award of emp_award){
                    award_point_data_set.push(item_award);
                }

                var emp_redeem = redeem_point_data.rows.filter((e)=> {return e.emp_id === item2.id});
                for(let item_redeem of emp_redeem){
                    redeem_point_data_set.push(item_redeem);
                }


                var emp_thank = thank_point_data.rows.filter((e)=> {return e.emp_id === item2.id});
                for(let item_thank of emp_thank){
                    thank_point_data_set.push(item_thank);
                }


                var emp_category = category_data.rows.filter((e)=> {return e.emp_id === item2.id});
                for(let item_category of emp_category){
                    category_point_data_set.push(item_category);
                }
            
                var emp_user = user_point_data.rows.filter((e)=> {return e.emp_id === item2.id});
                for(let item_user of emp_user){
                    item_user.department = item.dep_name;
                    user_point_data_set.push(item_user);
                }
                
                
            }
       
            
              
        }

        var award_point_data_final = [];
       
        for(let item2 of award_point_data_set){
           var check_award = award_point_data_final.filter((e)=>{return e.award_name == item2.award_name});
    
           if(check_award.length == 0){
            item2.count = 1;
            award_point_data_final.push(item2);
           }else{
       
            var index = award_point_data_final.findIndex((e) => e.award_name == item2.award_name);
            award_point_data_final[index].point = parseInt(award_point_data_final[index].point) + parseInt(item2.point);
            award_point_data_final[index].count += 1;
           }
        }


        var user_point_data_final = user_point_data_set.sort((a,b) => b.point - a.point);

 


        var redeem_point_data_final = [];
        for(let item2 of redeem_point_data_set){
            var check_redeem = redeem_point_data_final.filter((e)=>{return e.product_name == item2.product_name});
            
            if(check_redeem.length == 0){
             item2.count = 1;
             redeem_point_data_final.push(item2);
            }else{
        
             var index = redeem_point_data_final.findIndex((e) => e.product_name == item2.product_name);
          
             redeem_point_data_final[index].count += 1;
            }
         }

        
         

         var thank_point_data_final = [];
        for(let item2 of thank_point_data_set){
            var check_redeem = thank_point_data_final.filter((e)=>{return e.point_name == item2.point_name});
            
            if(check_redeem.length == 0){
             item2.count = 1;
             thank_point_data_final.push(item2);
            }else{
        
             var index = thank_point_data_final.findIndex((e) => e.point_name == item2.point_name);
          
             thank_point_data_final[index].count += 1;
            }
         }

         var category_point_data_final = [];
        for(let item2 of category_point_data_set){
            var check_category = category_point_data_final.filter((e)=>{return e.category_name == item2.category_name});
            
            if(check_category.length == 0){
             item2.count = 1;
             category_point_data_final.push(item2);
            }else{
        
             var index = category_point_data_final.findIndex((e) => e.category_name == item2.category_name);
          
             category_point_data_final[index].count += 1;
            }
         }

         var department_point_data_final = [];
         for(let item2 of summary_department_set){
             var check_category = department_point_data_final.filter((e)=>{return e.department == item2.department});
             
             if(check_category.length == 0){
      
              var temp = {
                point:parseInt(item2.point || 0),
                department:item2.department,
                count:1
            }
              department_point_data_final.push(temp);
             }else{
         
              var index = department_point_data_final.findIndex((e) => e.department == item2.department);
              department_point_data_final[index].point = parseInt(department_point_data_final[index].point || 0) + parseInt(item2.point || 0);
              department_point_data_final[index].count += 1;
             }
          }

         
       console.log("department_point_data_final",department_point_data_final)
        
        var user_point_arr = [];
        var count_ = 0;

        for(let item of user_point_data_final){
            if(count_ < 10){
                var detail = await condb2.clientQuery(querySummaryPoint.getEmpDetail,[item.emp_id]);
                if(detail.rows.length > 0){
                    var temp = {
                        emp_name:detail.rows[0].emp_name_th,
                        point:item.point,
                        department:item.department,
                        department_id:detail.rows[0].department_id
        
                    }
                    user_point_arr.push(temp);
                }
            }
           
            count_ +=1;
          
        }

        var budgetYear = budget_point.rows.length > 0 ? budget_point.rows[0].cb_budget_amount || 0 : 0;
        const data = {
            //no chart
            total_point:total_point_data,
            balance_point:budgetYear - total_point_data,
            award_point_transectaion: award_tran_data,
            thank_point_transection: thank_tran_data,
            redeem_point_transection: redeem_tran_data,
            sum_redeem_point: total_redeem_point_data,
            
            //chart
            summary_department_data:department_point_data_final.sort((a,b)=> b.point - a.point).filter((e,index)=>{return index < 5}),
            award_point_data:award_point_data_final.sort((a,b)=> b.count - a.count).filter((e,index)=>{return index < 10}),
            user_point_data:user_point_arr,
            redeem_point_data:redeem_point_data_final.sort((a,b)=> b.count - a.count).filter((e,index)=>{return index < 10}),
            thank_point_data:thank_point_data_final.sort((a,b)=> b.count - a.count).filter((e,index)=>{return index < 10}),
            category_data:category_point_data_final.sort((a,b)=> b.count - a.count).filter((e,index)=>{return index < 5}),

            budget_year_data:budget_year_data.rows.sort((a,b)=> a.year - b.year),
        }
        return response.success(data);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/filterSummaryPoint', [authenticateToken], filterSummaryPoint);

/**
* Add Award Point
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/

const getDepartment = async (req, res, next) => {
    const response = new Responsedata(req, res);
    try {
        const body = req.body;
        if (!body.company_id || body.company_id == "") {
            throw Error("company_id not found!!!");
        }
       
        var department_list = await condb2.clientQuery(querySummaryPoint.getDepartmentByCom,[body.company_id,body.department_id || null]);

        const data = {
            department_list: department_list.rows
        }

        return response.success(data);
    } catch (error) {
        return response.error([{
            errorcode: 400,
            errorDis: error.message
        }])
    }
}
router.post('/getDepartment', [authenticateToken], getDepartment);

module.exports = router;