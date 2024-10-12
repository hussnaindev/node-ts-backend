import { configDotenv } from 'dotenv';
import { Sequelize } from 'sequelize';
configDotenv();

// Create a new instance of Sequelize
export const sequelize = new Sequelize(
        process.env.MYSQL_DB || '',
        process.env.MYSQL_USER || '',
        process.env.MYSQL_PASSWORD || '',
        {
                host: process.env.MYSQL_HOST,
                dialect: 'mysql',
                logging: false, // Set to true if you want to see SQL logs
        }
);
