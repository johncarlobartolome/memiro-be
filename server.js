const { log } = require('console')
const dotenv = require('dotenv')
dotenv.config({path:'config.env'})
const app = require('./app')

const port = process.env.PORT || 3000

const server = app.listen(port,()=> {
    log(`listening to port:${port}. . .`)
})