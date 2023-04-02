var express = require("express");
var router = express.Router();
var baseService = require("../service/baseService");
var _baseService = new baseService();
/* var userService = require("../service/userService");
var _userService = new userService();
const _QueryLogin = require("../query/queryLogin.json");
var _QueryCompany = require("../query/queryCompany.json");
var companyService = require("../service/companyService");
var _companyService = new companyService(); */
const logService = require("../service/logservice");

const jwt = require("jwt-simple");
var moment = require("moment");
var JwtSetting = require("../jwtSetting");
const passport = require("passport");
passport.use(JwtSetting.jwtAuth);
const cryptoOption = require("../cryptoSetting");

const TokenEncode = (payload) => {
  return jwt.encode(payload, JwtSetting.SECRET);
};
const TokenDecode = (token) => {
  return jwt.decode(token, JwtSetting.SECRET);
};
const getUserIDByToken = (token) => {
  let payload = TokenDecode(token);
  if (payload.fup && payload.sys == "c") {
    return payload.fup;
  }
  return null;
};
const getAdminIDByToken = (token) => {
  let payload = TokenDecode(token);
  if (payload.fup && payload.sys == "s") {
    return payload.fup;
  }
  return null;
};
const getCompanyIdByToken = (token) => {
  let payload = TokenDecode(token);
  if (payload.com && payload.sys == "c") {
    return payload.com;
  }
  return null;
};
const getPayload = (token) => {
  return TokenDecode(token);
};
const requireJWTAuth = passport.authenticate("jwt", {
  session: false,
});

router.post("/authorized/service", async (req, res, next) => {
  var token = req.headers.authorization;
  var user_id = _getUserIDByToken(token);
  let _logService = new logService();
  let _log = _logService.model;

  _log.activity.parameter = {
    body: req.body,
    query: req.query,
    header: req.headers,
    payload: _getPayload(token),
  };
  _log.activity.path = req.baseUrl + req.path;


});

router.get("/test", requireJWTAuth, (req, res) => {
  res.status(200).json({
    message: "You Are Authorize",
  });
});

module.exports = {
  router: router,
  requireJWTAuth: requireJWTAuth,
  getUserIDByToken: getUserIDByToken,
  getAdminIDByToken: getAdminIDByToken,
  getPayload: getPayload,
  getCompanyIdByToken: getCompanyIdByToken,
};
