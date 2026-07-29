import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = Number.parseInt(process.env.PORT ?? '3002', 10)
const root = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(root, 'dist')

app.disable('x-powered-by')
app.use((_request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Referrer-Policy', 'same-origin')
  response.setHeader('X-Frame-Options', 'SAMEORIGIN')
  next()
})
app.get('/health', (_request, response) => {
  response.type('text/plain').send('ok')
})
app.use(express.static(dist))
app.get(/.*/, (_request, response) => {
  response.sendFile(path.join(dist, 'index.html'))
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Hypotheekplanner listening on port ${port}`)
})
