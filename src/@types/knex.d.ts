import { Knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        user: {
            id: string
            name: string
            email: string
            best_sequence_diet: number
            actual_sequence_diet: number
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
