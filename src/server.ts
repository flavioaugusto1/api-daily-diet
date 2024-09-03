import fastify from 'fastify'
import { env } from './env'

const app = fastify()

app.get('/hello', async (response) => {
    return console.log('')
})

app.listen({
    port: env.PORT,
}).then(() => {
    console.log('Server is Running')
})
