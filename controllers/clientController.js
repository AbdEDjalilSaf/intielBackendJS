import * as clientService from "../services/clientServices.js";
// import { hashPassword } from "../utils/helpers";
import bcrypt from 'bcrypt';
import { query } from "../db.js";
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
// import { logger } from '../utils/logger.js';



export const getClients = async (req, res) => {

if(req.query.q){
    const clients = await clientService.searchClients(req.query.q);
    res.status(200).json(clients);
}
else{
    try {
        const clients = await clientService.getClients();
        res.status(200).json(clients);
    } catch (err) { 
        console.error('Error fetching clients:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
} 




// Register new user
export const register = async (req, res) => {

  // const { first_name, last_name, email, password } = req.body;

  // console.log("first_name +++++++", first_name);
  // console.log("last_name +++++++", last_name);
  // console.log("email +++++++", email);
  // console.log("password +++++++", password);

  // if (!first_name || !last_name || !email || !password) {
  //   res.status(400).json({ 'message': 'first_name, last_name, email, password are required.' });
  //   return;
  // }

const clientData = req.body;
console.log("clientData +++++++", clientData);

if(!clientData){
    res.status(400).json({ 'message': 'first_name, last_name, email, password are required.' });
    return;
}
console.log("second operation =============")
const foundUser = await clientService.getUserByEmail(clientData.email);
if (foundUser) {
    res.status(400).json({ 'message': 'User already exists.' });
    return;
}
console.log("thired operation =============")
  try {
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(clientData.password, salt);
    
    console.log("fourth operation =============")
    // Save user to database
    const { rows } = await query(
      'INSERT INTO client (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
      [clientData.first_name, clientData.last_name, clientData.email, passwordHash]
    );
    console.log("five operation =============")
    const accessToken = jwt.sign({ 
    client_id: rows[0].client_id,
    email: rows[0].email
     }, process.env.JWT_SECRET, {
      expiresIn: "20m",
    });
    console.log("six operation =============")
    const refreshToken = jwt.sign(
      {
        client_id: rows[0].client_id   // ✅ REQUIRED
      },
      process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    console.log("success operation =============")
    res.status(201).json(
        {
        "meta": "",
        "succeeded": true,
        "message": "User registered successfully",
        "data":
            { 
                user: rows[0],
                "jwtAuthResult": { 
                    accessToken,
                "refreshToken": {
                    refreshToken 
                }
                } 
            }
  });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }  
  }
};




// Login user
export const login = async (req, res) => {

const {email, password} = req.body;

  try {
    
    // Find user
    const { rows } = await query('SELECT * FROM client WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const accessToken = jwt.sign({  
    client_id: rows[0].client_id,
    email: rows[0].email 
    }, process.env.JWT_SECRET, {
      expiresIn: "20m",
    });
    
    const refreshToken = jwt.sign({ client_id: rows[0].client_id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
  });
  
  res.status(200).json(
      {
      "meta": "",
      "succeeded": true,
      "message": "User logged in successfully",
      "errors": [
        "string"
      ],
      "data":
          { 
            user: rows[0], 
            "jwtAuthResult": { 
                accessToken, refreshToken 
            } }
});

  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }  
  }
};



export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      meta: "",
      succeeded: false,
      message: "Refresh token is required",
      errors: ["No refresh token provided"],
      data: null
    });
  }

  try {
    // ✅ Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    console.log("Decoded refresh token:", decoded);

    // ✅ Must contain client_id
    if (!decoded.client_id) {
      return res.status(401).json({
        meta: "",
        succeeded: false,
        message: "Invalid refresh token",
        errors: ["Token does not contain client_id"],
        data: null
      });
    }

    const clientId = decoded.client_id;

    // ✅ Query using ONLY existing column
    const { rows } = await query(
      "SELECT client_id, email FROM client WHERE client_id = $1",
      [clientId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        meta: "",
        succeeded: false,
        message: "User not found",
        errors: ["Invalid refresh token"],
        data: null
      });
    }

    const user = rows[0];

    // ✅ New access token
    const newAccessToken = jwt.sign(
      {
        client_id: user.client_id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "20m" }
    );

   

    return res.status(200).json({
      meta: "",
      succeeded: true,
      message: "Token refreshed successfully",
      errors: [],
      data: {
        jwtAuthResult: {
          accessToken: newAccessToken
        }
      }
    });

  } catch (error) {
    console.error("Refresh token error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        meta: "",
        succeeded: false,
        message: "Refresh token expired",
        errors: ["Please login again"],
        data: null
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        meta: "",
        succeeded: false,
        message: "Invalid refresh token",
        errors: ["Invalid token"],
        data: null
      });
    }

    return res.status(500).json({
      meta: "",
      succeeded: false,
      message: "Internal server error",
      errors: [error.message],
      data: null
    });
  }
};




export const changePassword = async (req, res) => {

  const {currentPassword, newPassword} = req.body;

try {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const userId = req.id;
  console.log("userId +++++++", userId);
  console.log("email +++++++", req.email);
  const userWithPassword = await clientService.getUserByEmail(req.email);
  console.log("userWithPassword +++++++", userWithPassword);

  if (!userWithPassword) {
      return res.status(404).json({ message: 'User not found' });
  }

  // Check password
  const isMatch = await bcrypt.compare(currentPassword, userWithPassword.password_hash);
  if (!isMatch) { 
    return res.status(401).json({ error: 'Current password is incorrect' });
  }else{
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    const { rows } = await query(
      'UPDATE client SET password_hash = $1 WHERE id = $2 RETURNING *',
      [passwordHash, userId]
    );
    return res.status(200).json(
      {
        "meta": "",
        "succeeded": true,
        "message": "Password changed successfully",
        "errors": [
          null
        ],
        "data":
            { 
              user: rows[0]
            }
    });
  }


} catch(err){
  if (err instanceof Error) {
    res.status(500).json({
      "meta": "",
      "succeeded": false,
      "message": "Password changed failed",
      "errors": [
        err.message
      ],
      "data": null
  } 
  );
  } else {
    res.status(500).json({
      "meta": "",
      "succeeded": false,
      "message": "Password changed failed",
      "errors": [
        'An unknown error occurred'
      ],
      "data": null
  } 
  );
  } 
}

}






export const confirmEmail = async (req,res) => {

const { token } = req.body;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { client_id } = decodedToken;
    const userWithPassword = await clientService.getUserByEmail(client_id);
    if (!userWithPassword) {
      return res.status(404).json({
        meta: "",
        succeeded: false,
        message: 'User not found',
        errors: [null],
        data: null
      });
    }
    const updatedUser = await clientService.updateClient(userWithPassword.client_id, { isactive: true });
    return res.status(200).json({
      meta: "",
      succeeded: true,
      message: 'Email confirmed successfully',
      error: null,
      data: updatedUser
    });
    
  } catch (error) {
   console.error("Error in confirmEmail:", error);
   console.error("Error stack:", error.stack);
   
   return res.status(500).json({
     meta: "",
     succeeded: false,
     message: 'Failed to confirm email',
     errors: [error.message], // Return the actual error message
     data: null
   });
  }
}
  
  