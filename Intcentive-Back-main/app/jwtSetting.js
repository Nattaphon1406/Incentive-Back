const jwt = require("jwt-simple");
var moment = require("moment");
var appSetting = require("./appSetting.js");
var userService = require('./service/userService')
var _userService = new userService();
//ใช้ในการ decode jwt ออกมา
const ExtractJwt = require("passport-jwt").ExtractJwt;
//ใช้ในการประกาศ Strategy
const JwtStrategy = require("passport-jwt").Strategy;
const SECRET = appSetting.jwtSecret; 
const jwtOptions = {
   jwtFromRequest: ExtractJwt.fromHeader("authorization"),
   secretOrKey: SECRET,//SECRETเดียวกับตอนencodeในกรณีนี้คือ MY_SECRET_KEY
}
const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
   if(payload.sys=="c"){
        _userService.checkAuth(payload.sub).then((res)=>(res.rows.length>0)?done(null, true):done(null, false)).catch(e=>done(null, false))
   }
});

module.exports = {
    SECRET : SECRET,
    jwtAuth:jwtAuth
};