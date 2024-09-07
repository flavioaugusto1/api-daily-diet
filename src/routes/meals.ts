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

    app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
        const { sessionId } = request.cookies

        const meals = await knex('meals')
            .where('session_id', sessionId)
            .select()

        return { meals }
    })

    app.get(
        '/:id',
        { preHandler: [checkSessionIdExists] },
        async (request, response) => {
            const idMealSchema = z.object({
                id: z.string(),
            })

            const { id } = idMealSchema.parse(request.params)

            const { sessionId } = request.cookies

            const meal = await knex('meals')
                .where('id', id)
                .andWhere('session_id', sessionId)
                .first()

            if (!meal) {
                return response.status(404).send({
                    error: 'Refeição não localizada.',
                })
            }

            return { meal }
        },
    )
}
