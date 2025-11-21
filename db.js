import pg from "pg"
import env from "dotenv"

env.config();


const db = new pg.Client({
    user: process.env.PG_USER,  // postgres
    host: process.env.PG_HOST,  // localhost
    database: process.env.PG_DATABASE, //name of table in database
    password: process.env.PG_PASSWORD,  // pssword = toot;
    port: Number(process.env.PG_PORT),  // 5432
    // ssl: {
    //   rejectUnauthorized: false
    // } 
  });
db.connect();

db.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

export const query = (text, params) => db.query(text, params);