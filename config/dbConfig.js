// config/dbConfig.js
const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "thinkepic_new",
});

db.connect((err) => {
  if (err) {
    console.error("Koneksi database gagal: ", err);
    return;
  }
  console.log("Terhubung ke database MySQL");
});

module.exports = db;
