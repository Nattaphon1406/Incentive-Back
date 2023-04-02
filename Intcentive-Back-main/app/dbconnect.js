const {
  Client,
  Pool
} = require('pg')
var dbConnect = require('./appSetting.js');
// const connectionString = 'postgresql://postgres:mysecretpassword@localhost:5432/testx';
// const pool = new Pool({
//     connectionString: connectionString,
//   })
const config = dbConnect.dbConnect.dbConnect;
const config2 = dbConnect.dbConnect.dbConnect2;

console.log(config.database)
console.log(config2.database)
// const pool = new Pool(config);
// try {
//   pool.connect((err, db) => {
//     if (err) {
//       console.log("error connect pool", err)
//     } else {
//       db.query('SELECT NOW()', (err, result) => {
//         if (err) console.log("error connect test Select", err);
//         console.log('connect database-->', result.rows)
//       })
//     }

//   });

// } catch (e) {
//   console.log("error connect pool", e)
// } finally {

// }

// var client = new Client({
//     connectionString: connectionString,
//   })
// client.connect()
// client.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
//   client.end()
// })

module.exports = {
  connectionPool: null,
  config: config,
  config2: config2
};