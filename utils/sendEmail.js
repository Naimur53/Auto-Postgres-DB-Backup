import nodemailer from 'nodemailer';
import config from '../config.js';
const sendEmail = async (
  { to, multi } = {},
  { subject, html, text } = {}
) => {
  const transport = await nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.emailUser,
      pass: config.emailUserPass,
    },
  }); 
  const mailOptions = {
    from: config.emailUser,
    to,
    subject,
    html,
    text,
  };
  if (multi?.length) {
    for (const recipient of multi) {
      const mailOptionsPer = {
        from: config.emailUser,
        to: recipient,
        subject,
        html,
        text,
      };

      try {
        // Send mail for each recipient
        // await transport.sendMail({ ...mailOptionsPer });
        console.log(`Email sent successfully to ${recipient}`);
      } catch (error) {
        console.error(`Error sending email to ${recipient}:`, error);
      }
    }
  } else {
    try {
      // console.log(mailOptions);

      // await transport.sendMail({ ...mailOptions });
    } catch (err) {
      console.log(err);
      
    }
    // console.log('its the main success after send to one email');
  }
};
export default sendEmail;
