const Axios = require('axios');
const config = require('../../../appSettingSite');

class systemService {

    constructor(token) {
        this.token = token;
    }

    Api(token) {
        return Axios.create({
            baseURL: `${config.URL_SERVER_API_SYSTEM}`,
            headers: {
                'Content-Type': 'application/json',
            },
            transformRequest: [function (data, headers) {

                if (token) {
                    headers.Authorization = "Bearer " + token
                }
                headers["x-ttt"] = config.CUSTOMHERDERKEY;
                return JSON.stringify(data);
            }],
        });
    }

    async GetMasterByid(token, code, id) {
        return new Promise(async (resolve, reject) => {
            try {
                const url = `/api/system/${code}/${id}`
                const { data } = await this.Api(token).get(url)
                resolve(data);
            } catch (error) {
                resolve(null)
            }
        });
    }
    async FilterMaster(token, code) {
        return new Promise(async (resolve, reject) => {
            try {
                const url = `/api/system/${code}`
                const { data } = await this.Api(token).get(url)
                resolve(data);
            } catch (error) {
                resolve(null)
            }
        });
    }

}

module.exports = systemService;