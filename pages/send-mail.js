// Import paket nodemailer
const nodemailer = require("nodemailer");
const db = require("../config/dbConfig");
const { getSmtpData } = require("./smtp_data");

// Fungsi untuk mengirim email verifikasi
async function sendVerificationEmail(email, verificationLink) {
  try {
    const id = 1; // Ganti dengan ID yang sesuai
    const smtp_ac = await getSmtpData(id);
    console.log(smtp_ac);

    // Konfigurasi transporter nodemailer
    const transporter = nodemailer.createTransport({
      host: smtp_ac.host,
      port: smtp_ac.port,
      secure: smtp_ac.secure,
      auth: {
        user: smtp_ac.username,
        pass: smtp_ac.password,
      },
    });

    // Kirim email
    await transporter.sendMail({
      from: smtp_ac.username,
      to: email,
      subject: "Verifikasi Email",
      html: `
        <html>
        <head>
          <style>
            .custom-btn {
              width: 200px;
              color: white;
              border-radius: 5px;
              padding: 10px 25px;
              font-family: 'Lato', sans-serif;
              font-weight: 500;
              background: transparent;
              cursor: pointer;
              transition: all 0.3s ease;
              position: relative;
              display: inline-block;
              box-shadow:inset 2px 2px 2px 0px rgba(255,255,255,.5),
              7px 7px 20px 0px rgba(0,0,0,.1),
              4px 4px 5px 0px rgba(0,0,0,.1);
              outline: none;
            }
            .btn-1 {
              background: rgb(0,172,238);
              background: linear-gradient(0deg, rgba(6,14,131,1) 0%, rgba(12,25,180,1) 100%);
              border: none;
              color: white;
            }
            .btn-1:hover {
              background: rgb(0,3,255);
              background: linear-gradient(0deg, rgba(0,3,255,1) 0%, rgba(2,126,251,1) 100%);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <b>Anda baru saja mendaftar di thinkepic</b>
            <br />
            <p>Silakan verifikasi alamat email Anda dengan mengklik pada tombol</p>
            <center>
              <a class="custom-btn btn btn-1" href="${verificationLink}">Verifikasi Email</a>
            </center>
            <center>
              <p> atau klik tautan berikut:</p>
              <a href="${verificationLink}">${verificationLink}</a>
            </center>
            <br />
            <p>tautan akan kadaluarsa dalam 6 jam dari pesan ini diterima</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`Email verifikasi dikirim ke ${email}`);
  } catch (error) {
    console.error(`Gagal mengirim email verifikasi: ${error}`);
  }
}

module.exports = sendVerificationEmail;
