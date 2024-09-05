import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary()
        table.text('name').notNullable()
        table.text('description').notNullable()
        table.boolean('in_diet').notNullable()
        table.uuid('session_id').notNullable()
        table.text('date_meal').notNullable()
        table.text('hour_meal').notNullable()
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals')
}
