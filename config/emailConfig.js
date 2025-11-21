import nodemailer from 'nodemailer';

// Create transporter configuration
export const createTransporter = () => {
  // Check if required environment variables are set
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Missing SMTP configuration in environment variables');
    return null;
  } 
    console.log("zero here ===============")
  try {
    console.log("one here ===============")
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("two here ===============")

    // Verify transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('Error verifying email transporter:', error);
      } else {
        console.log('Email transporter is ready to send messages');
      }
    });

    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    return null;
  }
};

// Create and export the transporter instance
export const transporter = createTransporter();