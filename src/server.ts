import fastify from 'fastify'
import { env } from './env'

const app = fastify()

app.get('/hello', async (response) => {
    return console.log('Hello world')
})

app.listen({
    port: env.PORT,
}).then(() => {
    console.log('Server is Running')
})
