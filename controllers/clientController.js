import * as clientService from "../services/clientServices.js";
// import { hashPassword } from "../utils/helpers";
import bcrypt from 'bcrypt';
import { query } from "../db.js";
import jwt from 'jsonwebtoken';



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


// export const createClient = async (req: Request, res: Response) => {
// //     if(req.body){
// //         const clientData = req.body;
// //         const data = matchedData(clientData);
// //         const result = validationResult(req);
// //       console.log("result",result);
// //         if(!result.isEmpty()){
// //           res.status(400).send({ errors: result.array() });
// //           return;
// //         }
      
// //       const newAddUser = await clientService.createClient(data);
// //       data.password = await hashPassword(data.password);
// //       console.log("data",data);
// //       try {
// //         await newAddUser.save()
// //         .then(() => console.log("Client saved successfully"))
// //         .catch((err: Error) => console.error("Error saving client:", err)); 
      
// //         res.status(201).send(newAddUser);
// //       } catch(err: any) {
// //         console.log("Error ---------------- ",err);
// //         res.status(400).send({error: (err as Error).message});
// //         return;
// //       }

// //     // try {
// //     //     const clientData = req.body;
// //     //     const newClient = await clientService.createClient(clientData);
// //     //     console.log("New Client:", newClient); 
// //     //     res.status(200).json(newClient);
// //     // } catch (err) { 
// //     //     console.error('Error adding client:', err);
// //     //     res.status(500).json({ message: 'Internal Server Error' });
// //     // }
// // }

// const {client_id, first_name, last_name, email, password_hash, isactive} = req.body;

// const reqData = matchedData(req.body);
// const result = validationResult(req);

// console.log("result",result);
// console.log("reqData",reqData);

// if (!email || !password_hash || !first_name || !last_name ) {
//     res.status(400).json({ 'message': 'Username and password are required.' });
//     return;
// }

// const foundUser = await clientService.getUserByEmail(email);
// if (foundUser) {
//     res.status(400).json({ 'message': 'User already exists.' });
//     return;
// }

// const match = await bcrypt.compare(password_hash, foundUser.password);
// console.log("match",match);


// if(match){
//     const hashedPassword = await hashPassword(password_hash);

// const roles = Object.values(foundUser.roles || {}).filter(Boolean);

// const 

//     const data = {
//         client_id,
//         first_name,
//         last_name,
//         email,
//         password_hash: hashedPassword,
//         isactive
//     };

//     const accessToken = jwt.sign(
//         {
//           "UserInfo": {
//             "username": foundUser.name,
//             "roles": roles
//           }
//         },
//         SECRET_KEY,
//         { expiresIn: "20m" }
//       );
  
//       const newRefreshToken = jwt.sign(
//         { "username": foundUser.name },
//         SECRET_KEY,
//         { expiresIn: '30d' }
//       );

//       res.status(200).json({
//         accessToken,
//         refreshToken: newRefreshToken
//       });
    
// }
// };



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

const foundUser = await clientService.getUserByEmail(clientData.email);
if (foundUser) {
    res.status(400).json({ 'message': 'User already exists.' });
    return;
}

  try {
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(clientData.password, salt);
    

    // Save user to database
    const { rows } = await query(
      'INSERT INTO client (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
      [clientData.first_name, clientData.last_name, clientData.email, passwordHash]
    );
    
    const accessToken = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "20m",
    });
    
    const refreshToken = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    
    res.status(201).json(
        {
        "meta": "",
        "succeeded": true,
        "message": "User registered successfully",
        "data":
            { 
                user: rows[0],
                "jwtAuthResult": { 
                    accessToken, refreshToken 
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
    
    const accessToken = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "20m",
    });
    
    const refreshToken = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
  });
  
  res.status(201).json(
      {
      "meta": "",
      "succeeded": true,
      "message": "User logged in successfully",
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




// Get current user
export const getMe = async (req, res) => {
    const {id} = req.params;
    console.log("id +++++++", id);
    // Add this check at the start of your controller
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
  
    try {
      const { rows } = await query(
        'SELECT id, username, email FROM client WHERE id = $1',
        [req.user.id]  // Now TypeScript knows req.user exists
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(rows[0]);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  };



export const updateClient = async (req, res) => {
    
    try {
        const clientId = req.params.id;
        const clientData = req.body;
        const updatedClient = await clientService.updateClient(clientId, clientData);
        if (!updatedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(updatedClient);

    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }  
    }
};


export const deleteClient = async (req, res) => {
    try {
        const clientId = req.params.id;
        const deleted = await clientService.deleteClient(clientId);
        if (!deleted) {
        return res.status(404).json({ message: 'Client not found' });
        }

        res.status(200).send();

    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }  }
};


export const searchClients = async (req, res) => {
    try {
      const searchTerm = req.query.q; // Get the search term from the query parameters
      const clients = await clientService.searchClients(searchTerm);
      res.status(200).json(clients);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }  
    }
  };





  
  