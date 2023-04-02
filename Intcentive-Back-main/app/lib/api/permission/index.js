const Axios = require('axios');
const config = require('../../../appSettingSite');

class permissionService {

    constructor(token) {
        this.token = token;
    }

    Api(token) {
        return Axios.create({
            baseURL: `${config.URL_SERVER_API_PERMISSION}`,
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

    async GetUserbyId(token, iu_id) {
        return new Promise(async (resolve, reject) => {
            try {
                const url = `/api/permission/get_user_by_id/${iu_id}`
                const { data } = await this.Api(token).get(url)
                resolve(data);
            } catch (error) {
                // console.log('error', error)
                resolve(null)
            }
        });
    }


}

module.exports = permissionService;