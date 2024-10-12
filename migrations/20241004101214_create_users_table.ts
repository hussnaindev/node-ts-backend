import { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
        return knex.schema.createTable('users', (table) => {
                table.increments('id').primary(); // `id` as primary key
                table.string('name').notNullable();
                table.string('email').unique().notNullable();
                table.string('password').notNullable();
                table.string('phone').notNullable();
                table.enu('user_type', ['client', 'owner', 'admin']).notNullable();
                table.timestamps(true, true);
        });
};

export const down = async (knex: Knex): Promise<void> => {
        return knex.schema.dropTable('users');
};
