import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});

export async function sendNotificationEmail(subject, text) {
    console.log("I am sending email") 
    try {
        const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: "2512surajdas@gmail.com", // send to self
        subject,
        text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}
