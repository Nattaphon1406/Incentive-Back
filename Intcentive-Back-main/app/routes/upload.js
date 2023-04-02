var express = require('express');
const logService = require('../service/logservice');
var {
    v4: uuidv4
} = require('uuid');
var XLSX = require('xlsx');
var mime = require('mime');
var multiparty = require('multiparty');

const authRouter = require('../routes/auth');
var _getPayload = authRouter.getPayload;
var _auth = authRouter.requireJWTAuth;
// mime.getType('txt');                    // ⇨ 'text/plain'
// mime.getExtension('text/plain');        // ⇨ 'txt'
var router = express.Router();

router.post('/', async (req, res) => {
    res.send({
        message: 'file uploaded'
    });
});
router.post('/profile', async (req, res, next) => {
    let _logService = new logService();
    let _log = _logService.model;
    var token = req.headers.authorization;
    _log.activity.parameter = {
        "body": req.body,
        "query": req.query,
        "header": req.headers,
        "payload": _getPayload(token)
    };
    _log.activity.path = req.baseUrl + req.path;
    try {

        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {

            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            //console.log(req.files.Profile);7
            let profile = req.files.Profile;
            let _genName = uuidv4() + "_" + profile.name;
            let path = req.body.typeFile;
            let rootPath = "./uploads/";
            let fullPath = rootPath + path + "/" + _genName;
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            console.log(fullPath);
            profile.mv(fullPath);
            console.log("HERE")
            let temp = {
                status: true,
                message: 'File is uploaded',
                data: {
                    orgin_name: profile.name,
                    name: _genName,
                    path: Buffer.from(fullPath).toString('base64'),
                    mimetype: profile.mimetype,
                    size: profile.size
                }
            }
            /*         _log.activity.response = temp; */
            //send response
            console.log(temp);
            res.send(temp);
        }
    } catch (err) {

        _log.activity.error = err.message
        _log.activity.status = false;
        res.status(500).send(err);

    } finally {
        _logService.log(_log).then(res => console.log("save log")).catch(e => console.log(e.message))
    }
});
router.post('/document', _auth, async (req, res, next) => {
    let _logService = new logService();
    let _log = _logService.model;
    var token = req.headers.authorization;
    _log.activity.parameter = {
        "body": req.body,
        "query": req.query,
        "header": req.headers,
        "payload": _getPayload(token)
    };
    _log.activity.path = req.baseUrl + req.path;
    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            var form = new multiparty.Form();
            form.parse(req, function (err, fields, files) {
                let profile = Array.isArray(req.files.Profile) ? req.files.Profile : [req.files.Profile];
                let data = [];
                profile.forEach(p => {
                    let _genName = uuidv4() + "_" + p.name;
                    let path = req.body.typeFile;
                    let rootPath = "./uploads/"
                    let fullPath = rootPath + path + "/" + _genName
                    //Use the mv() method to place the file in upload directory (i.e. "uploads")
                    p.mv(fullPath);
                    data.push({
                        orgin_name: p.name,
                        name: _genName,
                        path: Buffer.from(fullPath).toString('base64'),
                        mimetype: p.mimetype,
                        size: p.size
                    })
                })
                _log.activity.response = data;
                //send response
                res.send({
                    status: true,
                    message: 'File is uploaded',
                    data: data
                });
            })
        }
    } catch (err) {
        _log.activity.error = err.message
        _log.activity.status = false;
        res.status(500).send(err);
    } finally {
        _logService.log(_log).then(res => console.log("save log")).catch(e => console.log(e.message))
    }
});

router.post('/excel', async (req, res, next) => {
    console.log(mime.getType('xlsx') + "<---->" + req.files.file.mimetype)
    let mimeTypeExcel = [mime.getType('xlsx'), mime.getType('xls')];
    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else if (mimeTypeExcel.indexOf(req.files.file.mimetype) == -1) {
            res.send({
                status: false,
                message: 'No file XLSX'
            });
        } else {
            var workbook = XLSX.read(req.files.file.data, {
                type: 'buffer'
            });
            var sheet_name_list = workbook.SheetNames;
            var JsonList = [];
            sheet_name_list.forEach(ws => {
                JsonList.push(XLSX.utils.sheet_to_json(workbook.Sheets[ws]));
            })
            res.status(200).json(JsonList);
        }
    } catch (err) {
        res.status(500).send(err);
    }
})


module.exports = router;