var express = require('express');
var router = express.Router();
/* var baseService = require('../service/baseService'); */
const _config = require('../appSetting.js');
/* const {
    route
} = require('./users'); */
const path = require('path');
const fs = require('fs');
/* var _baseService = new baseService(); */

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Incentive V 0.0.1'
    });
});

router.get('/TestConnect2', function (req, res, next) {

    _baseService.TestConnnect2().then(_res => {
        res.status(200).json(_res.rows)
    }).catch(_error => {
        res.status(400).send({
            message: _error.message
        })
    })

});

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
    if (req.headers["x-ttt"] == _config.customHeaderKey) {
        next();
    } else if ((req.baseUrl + req.path).indexOf("static") > -1) {
        next();
    } else if((req.baseUrl + req.path).indexOf("logAccess") > -1) {
        next();
    }
    else {
        return res.status(404).send("i see you \n (⊙.⊙(☉̃ₒ☉)⊙.⊙)")
    }
})

router.get('/static/:code', async (req, res, next) =>{
    try {
        if (req.params.code) {
            var f = Buffer.from(req.params.code, 'base64').toString('utf8');
            if (f.indexOf("./uploads") == 0) {
                if(f.indexOf("/logs/") == 9){
                    return res.status(404).send("The file does not exist");
                }
                var temp = path.resolve(f);
                fs.access(temp, error => {
                    if (!error) {
                        res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(temp));
                        res.setHeader('Content-Transfer-Encoding', 'binary');
                        res.setHeader('Content-Type', 'application/octet-stream');
                        res.sendFile(temp,{},(err)=>{
                            if (err) {
                                next(err)
                            }
                        });
                    } else {
                        return res.status(404).send("The file does not exist");
                    }
                });
                // if (fs.existsSync(temp)) {
                //     res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(temp));
                //     res.setHeader('Content-Transfer-Encoding', 'binary');
                //     res.setHeader('Content-Type', 'application/octet-stream');
                //     res.sendFile(temp);
                //     console.log("The file exists.");
                // } else {
                //     return res.status(404).send("The file does not exist");
                // }
            }else{
                return res.status(404).send("The file does not exist");
            }

        } else {
            return res.status(404).send("The file does not exist");
        }

    } catch (ex) {
        return res.status(500).json(ex.message);
    }
    //    Buffer.from(fullPath).toString('base64')

});

module.exports = router;