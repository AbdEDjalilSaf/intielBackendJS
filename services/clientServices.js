import { query } from "../db.js"

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