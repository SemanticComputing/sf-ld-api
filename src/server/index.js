import http from 'http'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import path from 'path'
import favicon from 'serve-favicon'
import redirect from './middleware/redirect'
import route from './route'
import config from '../config.json'

let app = express()
app.server = http.createServer(app)

// logger
app.use(morgan('dev'))

// 3rd party middleware
app.use(favicon(path.join(__dirname, '../shared/images', 'favicon.ico')))
app.use(cors({exposedHeaders: config.corsHeaders}))
app.use(bodyParser.json({limit: config.bodyLimit}))

// internal middleware
app.use('/', redirect)

// static files
app.use('/public', express.static(__dirname+'/../dist/public'))

// api router
app.use('/', route)

app.server.listen(process.env.PORT || config.port)

console.log(`Started on port ${app.server.address().port}`)

export default app
