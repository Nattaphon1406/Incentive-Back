var CryptoJS = require("crypto-js");
var appSetting = require("./appSetting.js");
const SECRET = appSetting.jwtSecret;

const iv = CryptoJS.enc.Hex.parse("50616e796154686f6e676d75616e67");

const encrypt = (wording) => {
    return CryptoJS.AES.encrypt(wording, SECRET,{iv:iv}).toString()
}
const decrypt=(wording)=>{
    return  CryptoJS.AES.decrypt(wording, SECRET,{iv:iv}).toString(CryptoJS.enc.Utf8);
}



module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
}