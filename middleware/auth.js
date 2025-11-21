import jwt from 'jsonwebtoken';
import { query } from '../db.js';

export const authorizationToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token is required',
        succeeded: false
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ 
        message: 'Server configuration error',
        succeeded: false
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const { rows } = await query(
      'SELECT id, first_name, last_name, email FROM client WHERE id = $1',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        message: 'User not found',
        succeeded: false
      });
    }

    req.user = rows[0];
    next();
    
  } catch (err) {
    console.error('Auth middleware error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        succeeded: false
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        succeeded: false
      });
    }

    return res.status(500).json({ 
      message: 'Authentication failed',
      succeeded: false
    });
  }
};