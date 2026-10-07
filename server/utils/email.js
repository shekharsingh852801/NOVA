import nodemailer from "nodemailer";

// Using fake SMTP for local testing if credentials are not provided
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOrderConfirmation(order, customer, lines) {
  try {
    const itemsHtml = lines.map(line => 
      `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${line.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${line.size}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${line.color}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${line.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${line.lineTotal}</td>
      </tr>`
    ).join("");

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="text-align: center;">NOVA</h2>
        <h3 style="text-align: center;">Thank you for your order, ${customer.name}!</h3>
        <p>Your order <strong>${order.order_number}</strong> has been confirmed and will be processed shortly.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="text-align: left; background-color: #f9f9f9;">
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Item</th>
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Size</th>
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Color</th>
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Qty</th>
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
          <p>Subtotal: $${order.subtotal}</p>
          <p>Shipping: $${order.shipping}</p>
          <h4>Total: $${order.total}</h4>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"NOVA" <noreply@nova.shop>',
      to: customer.email,
      subject: `Order Confirmation - ${order.order_number}`,
      html,
    });
    
    console.log("Order confirmation email sent:", info.messageId);
    if (!process.env.SMTP_USER) {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
  } catch (err) {
    console.error("Failed to send order confirmation email:", err);
  }
}

export async function sendPasswordResetEmail(customer, resetLink) {
  try {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="text-align: center;">NOVA</h2>
        <h3>Password Reset Request</h3>
        <p>Hi ${customer.name},</p>
        <p>You requested a password reset. Click the button below to reset your password. This link is valid for 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #1a1a17; color: #f7f6f2; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"NOVA" <noreply@nova.shop>',
      to: customer.email,
      subject: "Password Reset Request - NOVA",
      html,
    });
    
    console.log("Password reset email sent:", info.messageId);
    if (!process.env.SMTP_USER) {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
  } catch (err) {
    console.error("Failed to send password reset email:", err);
  }
}
