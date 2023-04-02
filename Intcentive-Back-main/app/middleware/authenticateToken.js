const jwt = require('jsonwebtoken')
const config = require('../appSetting')
const logService = require('../service/logservice');
const authRouter = require('../routes/auth');

/**
* @param {import("express").Request} req 
* @param {import("express").Response} res 
* @param {import("express").NextFunction} next 
*/
module.exports = authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    if (!token)
        return res.sendStatus(401)
    jwt.verify(token, config.jwtSecret, async (err, model) => {
        if (err) return res.sendStatus(403)

        if (!authRouter.getUserIDByToken(token)) return res.status(400).send({
            message: "need correct level"
        })

        // const _logService = new logService();
        // const _log = _logService.model;

        // _log.activity.parameter = {
        //     "body": req.body,
        //     "query": req.query,
        //     "params": req.params,
        //     "header": req.headers,
        //     "payload": authRouter.getPayload(token)
        // };
        // _log.activity.path = req.baseUrl + req.path;
        // const _retrue = await _logService.log(_log);
        // res.log = {
        //     log: _log,
        //     id: _retrue,
        // }
        // req.model = model

        
        next()
    })
}


