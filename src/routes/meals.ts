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

            let [{ actual_sequence_diet, best_sequence_diet }] = await knex(
                'user',
            ).where('session_id', sessionId)

            if (in_diet) {
                actual_sequence_diet += 1
                best_sequence_diet < actual_sequence_diet
                    ? (best_sequence_diet = actual_sequence_diet)
                    : best_sequence_diet
            } else {
                actual_sequence_diet = 0
                best_sequence_diet < actual_sequence_diet
                    ? (best_sequence_diet = actual_sequence_diet)
                    : best_sequence_diet
            }

            await knex('user')
                .update({
                    actual_sequence_diet: actual_sequence_diet,
                    best_sequence_diet: best_sequence_diet,
                })
                .where('session_id', sessionId)

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

    app.get(
        '/',
        { preHandler: [checkSessionIdExists] },
        async (request, response) => {
            const { sessionId } = request.cookies

            const meals = await knex('meals')
                .where('session_id', sessionId)
                .select()

            return response.send({ meals })
        },
    )

    app.get(
        '/:id',
        { preHandler: [checkSessionIdExists] },
        async (request, response) => {
            const idMealSchema = z.object({
                id: z.string().uuid(),
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

    app.put(
        '/:id',
        { preHandler: [checkSessionIdExists] },
        async (request, response) => {
            const idMealSchema = z.object({
                id: z.string().uuid(),
            })

            const { id } = idMealSchema.parse(request.params)
            const { sessionId } = request.cookies

            const verifyIfMealExists = await knex('meals')
                .where('id', id)
                .andWhere('session_id', sessionId)

            if (!verifyIfMealExists) {
                return response.status(404).send({
                    error: 'Refeição não localizada.',
                })
            }

            const upadateMealsSchema = z.object({
                name: z.string().optional(),
                description: z.string().optional(),
                in_diet: z.boolean().optional(),
                date: z
                    .string()
                    .regex(
                        new RegExp(
                            /^(?:0[1-9]|[12]\d|3[01])\/(?:0[1-9]|1[0-2])\/\d{4}$/,
                        ),
                    )
                    .optional(),
                hour: z
                    .string()
                    .regex(new RegExp(/^(?:[01]\d|2[0-3]):[0-5]\d$/))
                    .optional(),
            })

            const validateMeal = upadateMealsSchema.safeParse(request.body)

            if (!validateMeal.success) {
                return response.status(404).send({
                    error: 'Um ou mais campos informados está inválidos.',
                })
            }

            const { name, description, in_diet, date, hour } = validateMeal.data

            await knex('meals')
                .update({
                    name: name,
                    description: description,
                    in_diet: in_diet,
                    date_meal: date,
                    hour_meal: hour,
                })
                .where('id', id)
                .andWhere('session_id', sessionId)

            response.send({
                message: 'Atualizado com sucesso.',
            })
        },
    )

    app.get(
        '/resume',
        { preHandler: [checkSessionIdExists] },
        async (request, response) => {
            const { sessionId } = request.cookies

            const [{ actual_sequence_diet, best_sequence_diet }] = await knex(
                'user',
            ).where('session_id', sessionId)

            const [{ meal_quantity }] = await knex('meals')
                .where('session_id', sessionId)
                .count({ meal_quantity: '*' })

            const [{ meal_inside_diet }] = await knex('meals')
                .where('in_diet', '=', 1)
                .andWhere('session_id', sessionId)
                .count({ meal_inside_diet: '*' })

            const [{ meal_outside_diet }] = await knex('meals')
                .where('in_diet', '=', 0)
                .andWhere('session_id', sessionId)
                .count({ meal_outside_diet: '*' })

            return response.send({
                actual_sequence_diet,
                best_sequence_diet,
                meal_quantity,
                meal_inside_diet,
                meal_outside_diet,
            })
        },
    )

    app.delete(
        '/:id',
        { preHandler: [checkSessionIdExists] },
        async (request, response) => {
            const idMealSchema = z.object({
                id: z.string().uuid(),
            })

            const { id } = idMealSchema.parse(request.params)
            const { sessionId } = request.cookies

            const verifyMealExists = await knex('meals')
                .where('id', id)
                .andWhere('session_id', sessionId)
                .first()

            if (!verifyMealExists) {
                return response.status(404).send({
                    error: 'Refeição não localizada.',
                })
            }

            await knex('meals').delete().where('id', id)
        },
    )
}
