import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { createUserRoutes } from './routes/users'
import { createMealRoutes } from './routes/meals'

export const app = fastify()
app.register(cookie)

app.register(createUserRoutes, {
    prefix: 'user',
})

app.register(createMealRoutes, {
    prefix: 'meals',
})
