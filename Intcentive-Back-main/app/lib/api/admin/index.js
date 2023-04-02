const Axios = require('axios');
const config = require('../../../appSettingSite');

class adminService {

    constructor(token) {
        this.token = token;
    }

    Api(token) {
        return Axios.create({
            baseURL: `${config.URL_SERVER_API_ADMIN}`,
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
                const url = `/api/admin/${code}/${id}`
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
                const url = `/api/admin/${code}`
                const { data } = await this.Api(token).get(url)
                resolve(data);
            } catch (error) {
                resolve(null)
            }
        });
    }

}

module.exports = adminService;