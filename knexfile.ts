import { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
        development: {
                client: 'mysql2',
                connection: {
                        host: process.env.MYSQL_HOST, 
                        user: process.env.MYSQL_USER, 
                        password: process.env.MYSQL_PASSWORD, 
                        database: process.env.MYSQL_DB, 
                },
                migrations: {
                        directory: './migrations', 
                        tableName: 'knex_migrations', 
                        extension: 'ts', 
                },
        },
};

export default config;
