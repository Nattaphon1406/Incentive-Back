const Axios = require('axios');
const config = require('../../../appSettingSite');

class taxInsuranceService {

    constructor(token) {
        this.token = token;
    }

    Api(token) {
        return Axios.create({
            baseURL: `${config.URL_SERVER_API_TAX_INSURANCE}`,
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

    async GetRenewalFormByid(token, id) {
        return new Promise(async (resolve, reject) => {
            try {
                const url = `/api/taxinsurance/getrenewalformById/${id}`
                const { data } = await this.Api(token).get(url)
                resolve(data);
            } catch (error) {
                resolve(null)
            }
        });
    }
    async GetRenewalFormatByid(token, id) {
        return new Promise(async (resolve, reject) => {
            try {
                const url = `/api/taxinsurance/getrenewalformatbyid/${id}`
                const { data } = await this.Api(token).get(url)
                resolve(data);
            } catch (error) {
                resolve(null)
            }
        });
    }
    async GetRenewalStatusByid(token, id) {
        return new Promise(async (resolve, reject) => {
            try {
                const url = `/api/taxinsurance/getrenewalstatusbyid/${id}`
                const { data } = await this.Api(token).get(url)
                resolve(data);
            } catch (error) {
                resolve(null)
            }
        });
    }
    async GetRenewalSupplierByid(token, id) {
        return new Promise(async (resolve, reject) => {
            try {
                const url = `/api/taxinsurance/getrenewalsupplierbyid/${id}`
                const { data } = await this.Api(token).get(url)
                resolve(data);
            } catch (error) {
                resolve(null)
            }
        });
    }
    async GetRenewalTypeByid(token, id) {
        return new Promise(async (resolve, reject) => {
            try {
                const url = `/api/taxinsurance/getrenewaltypebyid/${id}`
                const { data } = await this.Api(token).get(url)
                resolve(data);
            } catch (error) {
                resolve(null)
            }
        });
    }

}

module.exports = taxInsuranceService;