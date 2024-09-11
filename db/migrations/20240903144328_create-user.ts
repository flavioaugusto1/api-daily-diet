import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('user', (table) => {
        table.uuid('id').primary()
        table.text('name').notNullable()
        table.text('email').notNullable()
        table.integer('actual_sequence_diet').defaultTo('0')
        table.integer('best_sequence_diet').defaultTo('0')
        table.uuid('session_id')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('user')
}
