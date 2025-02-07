const mysql = require("mysql");

const db = mysql.createConnection({
  host: "srv1827.hstgr.io",
  user: "u710854811_chintantrivedi",
  password: "Chintan@2174",
  database: "u710854811_ctp",
});

db.connect((err) => {
  if (err) {
    console.log("Error connecting to MySQL:", err);
    return;
  }
  console.log("MySQL connected!");
});

module.exports = db;
