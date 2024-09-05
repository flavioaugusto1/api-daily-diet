import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

export async function createUserRoutes(app: FastifyInstance) {
    app.post('/', async (request, response) => {
        const userSchema = z.object({
            name: z.string(),
            email: z.string(),
        })

        const { name, email } = userSchema.parse(request.body)

        const checkEmailExists = await knex('user')
            .where('email', email)
            .select('*')
            .first()

        if (checkEmailExists) {
            return response.status(401).send({
                error: 'User already exists',
            })
        }

        const generateSessionId = randomUUID()
        const generateCookie = response.cookie('sessionId', generateSessionId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 dias
        })

        const { sessionId } = generateCookie.request.cookies

        await knex('user').insert({
            id: randomUUID(),
            name,
            email,
            session_id: sessionId,
        })

        response.status(201).send()
    })
}
