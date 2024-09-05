import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middlewares/check-sessionId'

export async function createMealRoutes(app: FastifyInstance) {
    app.post(
        '/',
        { preHandler: [checkSessionIdExists] },
        async (request, response) => {
            const createMealsSchema = z.object({
                name: z.string(),
                description: z.string(),
                in_diet: z.boolean(),
                date: z.string(),
                hour: z.string(),
            })

            const { name, description, in_diet, date, hour } =
                createMealsSchema.parse(request.body)

            const { sessionId } = request.cookies

            await knex('meals').insert({
                id: randomUUID(),
                name,
                description,
                session_id: sessionId,
                in_diet,
                date_meal: date,
                hour_meal: hour,
            })

            response.status(201).send()
        },
    )
}
