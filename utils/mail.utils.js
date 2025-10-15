import nodemailer from "nodemailer";

const sendEmail = (subject, msg, userEmail) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: userEmail,
      subject,
      html: msg,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err.message);
      }

      console.log(`Email sent: ${info.response}`);
    });
  } catch (err) {
    console.log(err.message);
  }
};

export { sendEmail };
