import { configDotenv } from 'dotenv';
import { Sequelize } from 'sequelize';
configDotenv();

const isLocal = process.env.ENV === 'dev';

export const sequelize = new Sequelize(
        process.env.MYSQL_DB || '',
        process.env.MYSQL_USER || '',
        process.env.MYSQL_PASSWORD || '',
        {
                host: isLocal ? process.env.MYSQL_HOST : undefined, // Use MYSQL_HOST for local
                dialectOptions: isLocal
                        ? {}
                        : { socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}` }, // Use Cloud SQL socket for production             
                dialect: 'mysql',
                logging: false, // Set to true if you want to see SQL logs
        }
);
