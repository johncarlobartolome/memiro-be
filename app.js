const express = require('express')
const app = express()
const homeRoute = require('./routes/homeRoute')
const userRoute = require('./routes/userRoute')
const morgan = require('morgan')
const globalErrorController = require('./controllers/errorController')
const AppError = require('./utils/appError')

app.use(express.json())

//HOMEPAGE ROUTE
app.use('/',homeRoute)
app.use('/users',userRoute)
app.all('*',(req,res,next)=>{
    const error = new Error(`Can't find ${req.originalUrl} in this Server!`)
    error.statusCode = 404
    return next(new AppError(error.message,error.statusCode))
})
app.use(globalErrorController)

if(process.env.NODE_ENV === 'development')app.use(morgan('dev'))

module.exports = app