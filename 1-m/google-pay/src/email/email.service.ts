// src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // Configure the transporter with your SMTP details (e.g., Gmail, SendGrid, etc.)
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',         // Replace with your SMTP host
      port: 587,                        // SMTP port
      secure: false,                    // use TLS
      auth: {
        user: 'sklallucination@gmail.com', // SMTP username
        pass: 'jhuo vreu fctq fptv',    // SMTP password
      },
    });
  }

  // Send an email notification for a transaction
  async sendTransactionEmail(details: {
    senderId: string;
    receiverId: string;
    amount: number;
    type: string;
  }): Promise<void> {
    // For demo, use hard-coded emails; in a real app, lookup emails by senderId/receiverId.
    const senderEmail = 'sklallucination@gmail.com';
    const receiverEmail = 'sklallucination@gmail.com';

    const mailOptions = {
      from: '"Google Pay App" <no-reply@googlepayapp.com>',
      to: `${senderEmail}, ${receiverEmail}`,
      subject: 'Transaction Notification',
      text: `A transaction has been processed:
Sender ID: ${details.senderId}
Receiver ID: ${details.receiverId}
Amount: ${details.amount}
Type: ${details.type}`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log('Email sent: ' + info.response);
    } catch (err) {
      this.logger.error('Error sending email', err);
    }
  }
}
