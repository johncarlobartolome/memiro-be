const { log } = require('console')
const dotenv = require('dotenv')
dotenv.config({path:'config.env'})
const mongoose = require('mongoose')
const app = require('./app')

const DB = process.env.DATABASE.replace('<password>',process.env.PASSWORD)
mongoose.connect(DB).then(()=> {
    log("Connected to DB!")
})

const port = process.env.PORT || 3000

const server = app.listen(port,()=> {
    log(`listening to port:${port}. . .`)
})

process.on('unhandledRejection',err => {
    log(err.name, err.message,err.stack)
    log("Unhandled Rejection ERROR")
})