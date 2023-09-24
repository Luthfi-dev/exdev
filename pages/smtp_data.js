// smtpData.js

const db = require("../config/dbConfig");

function getSmtpData(id) {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM smtp_mail WHERE id=?", [id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
}

module.exports = { getSmtpData };
