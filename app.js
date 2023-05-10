const express = require('express')
const app = express()
const homeRoute = require('./routes/homeRoute')
const morgan = require('morgan')
app.use('/',homeRoute)
if(process.env.NODE_ENV === 'development')app.use(morgan('dev'))

module.exports = app