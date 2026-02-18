const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "whatsapp_bulk"
});

module.exports = db.promise();
