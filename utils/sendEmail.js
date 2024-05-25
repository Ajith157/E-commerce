const nodemailer=require('nodemailer')


const sendEmail = async (email, message) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
  
    const info = await transporter.sendMail({
      from: '"E-commerce" <ajithpr9999@gmail.com>',
      to: email,
      subject: "Welcome to Our Store", 
      html: `
        <html>
          <head>
            <style>
              /* Add your custom styles here */
              body {
                font-family: Arial, sans-serif;
                color: #333;
              }
            </style>
          </head>
          <body>
            <h1>Welcome to Our Store!</h1>
            <p>${message}</p>
            <p>Thank you for joining us. We hope you enjoy your shopping experience!</p>
            <p>Best regards,<br/>E-commerce Team</p>
          </body>
        </html>
      `,
    });
  
  };
  

module.exports =sendEmail;  