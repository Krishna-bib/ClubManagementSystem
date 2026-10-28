import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMysqlSsl } from './utils/mysqlSsl.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASS = '',
  DB_NAME = 'club_management'
} = process.env;

async function setupDatabase() {
  console.log(`Connecting to MySQL at ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);
  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      ssl: getMysqlSsl(),
      multipleStatements: true
    });

    console.log('Connected to MySQL server.');

    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`Executing schema from ${sqlPath}...`);
    await connection.query(sql);

    console.log(`\n Database "${DB_NAME}" and all tables configured successfully!`);
  } catch (error) {
    console.error('\n Database setup failed:');
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('>> Access denied! Please check your MySQL DB_USER and DB_PASS in backend/.env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('>> Could not connect to MySQL server. Is MySQL running on port ' + DB_PORT + '?');
    } else {
      console.error(error.message);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
