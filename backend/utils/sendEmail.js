import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"ShopZen" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent: ${info.messageId}`);
  return info;
};

export const orderConfirmationEmail = (order, user) => ({
  to: user.email,
  subject: `✅ Order Confirmed - #${order.orderNumber}`,
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px">
      <h1 style="color:#FF6B35">ShopZen 🛒</h1>
      <h2>Hi ${user.name}, your order is confirmed!</h2>
      <p>Order Number: <strong>#${order.orderNumber}</strong></p>
      <p>Total: <strong>₹${order.totalPrice}</strong></p>
      <p>Estimated Delivery: <strong>${new Date(order.estimatedDelivery).toDateString()}</strong></p>
      <hr/>
      <p style="color:#666;font-size:12px">Thank you for shopping with ShopZen!</p>
    </div>
  `,
});

export default sendEmail;