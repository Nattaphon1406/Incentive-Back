var baseService = require('./baseService');
var _baseService = new baseService();
/* var _QueryLogin = require('../query/queryLogin.json')
var _QueryUser = require('../query/queryUser.json') */
const _config = require("../appSetting.js");
const { Client, Pool } = require("pg");
const connectionSetting = require("../dbconnect");
const connectionPool = connectionSetting.connectionPool;
const connectionConfig = connectionSetting.config;
var moment = require("moment");
var { v4: uuidv4 } = require("uuid");
const cryptoOption = require("../cryptoSetting");
class userService{
   /*  async checkAuth(user){
        return _baseService.baseQueryWithParameter(_QueryLogin.getByUser,[user])
    }
    async updateAdminToken(token,token_create,token_exp,user){
        return _baseService.baseQueryWithParameter(_QueryLogin.updateAdminToken,[token,token_create,token_exp,user])
    }
    async updateUserToken(token,token_create,token_exp,user){
        return _baseService.baseQueryWithParameter(_QueryLogin.updateUserToken,[token,token_create,token_exp,user])
    }
    async checkAdminAuth(id){
        return _baseService.baseQueryWithParameter(_QueryLogin.getByAdmin,[id])
    }

   
    async getUserById(user_id) {
        return new Promise(async (resolve, reject) => {
          try {
            (async () => {
              var client = new Client(connectionConfig);
              await client.connect();
              try {
              
                var data = await client.query(_QueryUser.getUserById,[user_id]);
           
          
                console.log(data.rows[0]);
                resolve(data.rows[0]);
              } catch (e) {
                reject(e);
              } finally {
                await client.end();
              }
            })().catch((e) => {
              console.log(e);
              throw Error(e);
            });
          } catch (e) {
            reject(e);
          }
        });
      }


      async update(model,user_id) {
        return new Promise(async (resolve, reject) => {
          try {
            (async () => {
              var client = new Client(connectionConfig);
              await client.connect();
              try {
              
            console.log(model)
           
                await client.query(_QueryUser.update,[
                    user_id,
                    model.name,
                    model.sirname,
                    model.email,
                    model.mobile1,
                    model.mobile2,
                    model.detail,
                    model.user_profile,
                    model.user_profile_name,
                    model.user_profile_path,
                ]);
               
                resolve(true);
              } catch (e) {
                reject(e);
              } finally {
                await client.end();
              }
            })().catch((e) => {
              console.log(e);
              throw Error(e);
            });
          } catch (e) {
            reject(e);
          }
        });
      }

      async changePS(model,user_id) {
        return new Promise(async (resolve, reject) => {
          try {
            (async () => {
              var client = new Client(connectionConfig);
              await client.connect();
              try {
           
            var check = await client.query(_QueryUser.checkPS,[user_id])    
          
            
                if(cryptoOption.decrypt(check.rows[0].password) === model.old_pass){
                    console.log("รหัสเดิม ถูกต้อง")
                    await client.query(_QueryUser.changePS,[
                        user_id,
                        cryptoOption.encrypt(model.new_pass),
                    ]);
                    resolve(true);
                }else{
                    throw Error("รหัสผ่านเดิมไม่ถูกต้อง !!!");
                  
                }
           
              } catch (e) {
                reject(e);
              } finally {
                await client.end();
              }
            })().catch((e) => {
              console.log(e);
              throw Error(e);
            });
          } catch (e) {
            reject(e);
          }
        });
      }
 */


}
module.exports = userService;