import { query } from "../db.js"
import jwt from 'jsonwebtoken';


export const getClients = async() => {
    const {rows} = await query('SELECT * FROM client');
    return rows;
}

export const createClient = async(clientData) => {
    const { client_id, first_name, last_name, email, password_hash, isactive } = clientData;
    const { rows } = await query(
        `INSERT INTO client (client_id, first_name, last_name, email, password_hash, isactive) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [client_id, first_name, last_name, email, password_hash, isactive]
      );
    
    return rows[0];
}

// Fixed service functions
// export const generateConfirmationToken = async (userId) => {
//   try {
//     console.log("userId +++++++", userId);
    
//     // Check if JWT_SECRET exists
//     if (!process.env.JWT_SECRET) {
//       throw new Error("JWT_SECRET is not defined in environment variables");
//     }
    
//     const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//       expiresIn: "24h",
//     });
    
//     console.log('token generated +++++++', token ? 'Success' : 'Failed');
//     return token;
//   } catch (error) {
//     console.error("Error generating token:", error);
//     throw error; // Re-throw to be caught by the controller
//   }
// };


// export const emailService = async (email, name, token) => {
//   try {
//     console.log("one =============");
//     // Check if SMTP is configured
//     if (!process.env.SMTP_USER) {
//       throw new Error("SMTP_USER is not defined in environment variables");
//     }
//     console.log("two =============");
//     // Check if transporter is initialized
//     if (!transporter) {
//       throw new Error("Email transporter is not initialized");
//     }
//     console.log("three =============");
//     const mailOptions = {
//       from: process.env.SMTP_USER,
//       to: email,
//       subject: "Confirm your email address",
//       text: `Hello ${name},
      
// Please click on the following link to confirm your email address:
// http://localhost:3000/confirm/${token}

// Thank you`,
//     };
    
//     console.log("four =============");
//     console.log("Attempting to send email to:", email);
//     const result = await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully:", result.messageId);
    
//     return true;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     console.error("Email error details:", error.message);
//     // Don't just return false - throw the error so we can see what went wrong
//     throw new Error(`Email service failed: ${error.message}`);
//   }
// };




export const generateConfirmationToken = async (userId) => {
  try {
    console.log("userId +++++++", userId);

    // Check if JWT_SECRET exists 
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    console.log('token generated +++++++', token ? 'Success' : 'Failed');
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};



export const updateClient = async (clientId, clientData) => {
    const { client_id, first_name, last_name, email, password_hash, isactive } = clientData;
  
    const { rows } = await query(
      `UPDATE client SET client_id = $1, first_name = $2, last_name = $3, email = $4, password_hash = $5, isactive = $6 
       WHERE id = $7 RETURNING *`,
      [client_id, first_name, last_name, email, password_hash, isactive, clientId]
    );
  
    return rows[0];
  };


export const deleteClient = async (clientId) => {
    const { rowCount } = await query(`DELETE FROM client WHERE id = $1`, [clientId]);
    return rowCount !== null && rowCount > 0; // Returns true if a row was deleted, false otherwise
};

export const searchClients = async (searchTerm) => {
    const { rows } = await query(
      `SELECT * FROM client WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1`,
      [`%${searchTerm}%`]
    );
    return rows;
};

export const getUserByEmail = async (email) => {
    const { rows } = await query(
        'SELECT * FROM client WHERE email = $1',
        [email]
    );
    return rows[0]; // Returns the first matching user or undefined if not found
};

//   CREATE TABLE employees (
//     employee_id SERIAL PRIMARY KEY,
//     first_name VARCHAR(50) NOT NULL,
//     last_name VARCHAR(50) NOT NULL,
//     email VARCHAR(100) UNIQUE,
//     hire_date DATE NOT NULL,
//     salary NUMERIC(10,2),
//     department_id INTEGER,
//     is_active BOOLEAN DEFAULT TRUE,
//     CONSTRAINT fk_department
//         FOREIGN KEY (department_id)
//         REFERENCES departments(department_id)
// );