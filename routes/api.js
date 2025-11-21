// import express from 'express';
// const router = express.Router();


// // Sample data
// let users = [
//   { id: 1, name: 'John Doe', email: 'john@example.com' },
//   { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
// ];

// // GET all users
// router.get('/users', (req, res) => {
//   res.json(users);
// });

// // GET user by ID
// router.get('/users/:id', (req, res) => {
//   const user = users.find(u => u.id === parseInt(req.params.id));
//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }
//   res.json(user);
// });

// // POST create new user
// router.post('/users', (req, res) => {
//   const { name, email } = req.body;
  
//   if (!name || !email) {
//     return res.status(400).json({ error: 'Name and email are required' });
//   }

//   const newUser = {
//     id: users.length + 1,
//     name,
//     email
//   };

//   users.push(newUser);
//   res.status(201).json(newUser);
// });

// export default router;
















import express from 'express';
import * as clientController from '../controllers/clientController.js'; 
import { changePasswordValidation } from '../middleware/validation.js';
import { authorizationToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit'; 

const router = express.Router(); 

// Rate limiting: max 5 requests per 15 minutes
const confirmEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    message: 'Too many confirmation email attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The user name
 *         email:
 *           type: string
 *           description: The user email
 *       example:
 *         id: 1
 *         name: John Doe
 *         email: john@example.com
 *     LogIn:
 *       type: object 
 *       required:
 *         - name
 *         - email 
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The user name
 *         email:
 *           type: string
 *           description: The user email
 *       example:
 *         id: 1
 *         name: John Doe
 *         email: john@example.com
 *     ChangePassword:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: The user's current password
 *         newPassword:
 *           type: string
 *           description: The user's new password
 *       example:
 *         currentPassword: "oldPassword123"
 *         newPassword: "newPassword456"
 *     ChangePasswordResponse:
 *       type: object
 *       properties:
 *         meta:
 *           type: string
 *           description: Success message
 *         succeeded:
 *           type: boolean
 *           description: Success message
 *         error:
 *           type: array
 *           description: Success message
 *         data:
 *           type: string
 *           description: Success message
 *       example:
 *         meta: ""
 *         succeeded: true
 *         error: [ string ]
 *         data: "string"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       name: Authorization
 *       in: header
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Auth management API
 */

/**
 * @swagger
 * /api/Authentication/signUp:
 *   post:
 *     summary: Create a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: The user first name
 *               last_name:
 *                 type: string
 *                 description: The user last name
 *               email:
 *                 type: string
 *                 description: The user email
 *               password:
 *                 type: string
 *                 description: The user password
 *             example:
 *               first_name: John 
 *               last_name: Doe
 *               email: john@example.com
 *               password: passW0rd@
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - missing name or email
 */
router.post('/api/Authentication/signUp',clientController.register);

/**
 * @swagger
 * /api/Authentication/signIn:
 *   post:
 *     summary: log in 
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user email
 *               password:
 *                 type: string
 *                 description: The user password
 *             example:
 *               email: john@example.com
 *               password: passW0rd@
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogIn'
 */
router.post('/api/Authentication/signIn',clientController.login);

/**
 * @swagger
 * /api/Authentication/changePassword:
 *   put:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChangePasswordResponse'
 */
router.put('/api/Authentication/changePassword',authorizationToken,changePasswordValidation,clientController.changePassword);

/**
 * @swagger
 * tags:
 *   name: ConfirmEmail
 *   description: ConfirmEmail management API
 */

/**
 * @swagger
 * /api/ConfirmEmail/sendConfirmEmail:
 *   post:
 *     summary: Send confirmation email
 *     description: Send a confirmation email to verify user's email address. Rate limited to 5 requests per 15 minutes.
 *     tags: [ConfirmEmail]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address to send confirmation to
 *             example:
 *               email: john@example.com
 *     responses:
 *       200:
 *         description: Confirmation email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Confirmation email sent successfully"
 *                 succeeded:
 *                   type: boolean
 *                   example: true
 *       429:
 *         description: Too many requests - rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Too many confirmation email attempts. Please try again later."
 *       400:
 *         description: Bad request - invalid email or user not found
 *       500:
 *         description: Internal server error - failed to send email
 */
router.post('/api/ConfirmEmail/sendConfirmEmail', confirmEmailLimiter, clientController.sendConfirmEmail);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns the list of all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/api/users', clientController.getClients);



export default router;