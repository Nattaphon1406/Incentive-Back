const config = require("./appSettingSite.js");
var _config ={
    dev:{
    
    "dbConnect":{
        "user":config.DB_USERNAME_DEV,
        "host": config.DB_SERVER_DEV,
        "database": config.DB_NAME_DEV,
      /*   "database2": config.DB_NAME_DEV2, */
        "password": config.DB_PASSWORD_DEV,
        "port":config.DB_PORT_DEV,
        "max": 10,
        "idleTimeoutMillis": 30000,
        "connectionTimeoutMillis": 5000,
    },
    "dbConnect2":{
        "user":config.DB_USERNAME_DEV,
        "host": config.DB_SERVER_DEV,
        "database": config.DB_NAME_DEV2,
       /*  "database2": config.DB_NAME_DEV2, */
        "password": config.DB_PASSWORD_DEV,
        "port":config.DB_PORT_DEV,
        "max": 10,
        "idleTimeoutMillis": 30000,
        "connectionTimeoutMillis": 5000,
    },
    "dbLogConnect":{
        "user":config.LOG_DB_USERNAME_DEV,
        "host": config.LOG_DB_SERVER_DEV,
        "database": config.LOG_DB_NAME_DEV,
        "password": config.LOG_DB_PASSWORD_DEV,
        "port":config.LOG_DB_PORT_DEV,
        "max": 10,
        "idleTimeoutMillis": 30000,
        "connectionTimeoutMillis": 5000
    }
} ,
test:{
    
    "dbConnect":{
        "user":config.DB_USERNAME_TEST,
        "host": config.DB_SERVER_TEST,
        "database": config.DB_NAME_TEST,
        "password": config.DB_PASSWORD_TEST,
        "port":config.DB_PORT_TEST,
        "max": 10,
        "idleTimeoutMillis": 30000,
        "connectionTimeoutMillis": 5000,
    },
    "dbLogConnect":{
        "user":config.LOG_DB_USERNAME_TEST,
        "host": config.LOG_DB_SERVER_TEST,
        "database": config.LOG_DB_NAME_TEST,
        "password": config.LOG_DB_PASSWORD_TEST,
        "port":config.LOG_DB_PORT_TEST,
        "max": 10,
        "idleTimeoutMillis": 30000,
        "connectionTimeoutMillis": 5000
    }
} ,
 
prod:{
    
    "dbConnect":{
        "user":config.DB_USERNAME_PROD,
        "host": config.DB_SERVER_PROD,
        "database": config.DB_NAME_PROD,
        "password": config.DB_PASSWORD_PROD,
        "port":config.DB_PORT_PROD,
        "max": 10,
        "idleTimeoutMillis": 30000,
        "connectionTimeoutMillis": 5000,
    },
    "dbLogConnect":{
        "user":config.LOG_DB_USERNAME_PROD,
        "host": config.LOG_DB_SERVER_PROD,
        "database": config.LOG_DB_NAME_PROD,
        "password": config.LOG_DB_PASSWORD_PROD,
        "port":config.LOG_DB_PORT_PROD,
        "max": 10,
        "idleTimeoutMillis": 30000,
        "connectionTimeoutMillis": 5000
    }
} 

}

module.exports ={
   "dbConnect":_config[config.START_PROJECT],
   
   "host":config.HOST,
   "port":config.PORT,
   "jwtSecret":config.JWTSECRET,
   "customHeaderKey":config.CUSTOMHERDERKEY,
   "userSwagger":config.USERSWAGGER,
   "passwordSwagger":config.PASSWORDSWAGGER,
   "logAccessPath":config.LOGACCESSPATH
   ,
   "passwordAcademy":config.PASSWORDACADEMY


    }