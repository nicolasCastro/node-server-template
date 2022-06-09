import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config();

const database = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASS, {
    host: 'localhost',
    dialect: 'mysql'
});

export default database;