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

const router = express.Router();

// Sample data
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

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
 *       201:
 *         description: User created successfully
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
// router.get('/users', (req, res) => {
//   res.json(users);
// });

router.get('/api/users', clientController.getClients);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/api/users/:id', (req, res) => {
  const user = client.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// /**
//  * @swagger
//  * /api/users:
//  *   post:
//  *     summary: Create a new user
//  *     tags: [Users]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - name
//  *               - email
//  *             properties:
//  *               name:
//  *                 type: string
//  *                 description: The user name
//  *               email:
//  *                 type: string
//  *                 description: The user email
//  *             example:
//  *               name: John Doe
//  *               email: john@example.com
//  *     responses:
//  *       201:
//  *         description: User created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/User'
//  *       400:
//  *         description: Bad request - missing name or email
//  */


// router.post('/api/users', (req, res) => {
//   const { name, email } = req.body;
   
//   if (!name || !email) {
//     return res.status(400).json({ error: 'Name and email are required' });
//   }
 
//   const newUser = {
//     id: client.length + 1,
//     name,
//     email
//   };
 
//   client.push(newUser);
//   res.status(201).json(newUser);
// });

export default router;