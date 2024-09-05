import { Knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        user: {
            id: string
            name: string
            email: string
            session_id: string
            created_at: string
        }
        meals: {
            id: string
            name: string
            description: string
            in_diet: boolean
            session_id: string
            date_meal: string
            hour_meal: string
        }
    }
}
