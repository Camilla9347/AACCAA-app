// get connection string
// setup .env with MONGO_URL variable and assign the value
// import dotenv and setup package
require('dotenv').config();

// import 'exress-async-errors' package
// apply try-catch automatically to all controllers
require('express-async-errors')

// Setup Basic Express Server
// import express and assign to variable
const express = require('express');
const app = express();

// rest of the packages
const morgan = require('morgan')

// database
// import connect() and invoke the starter
const connectDB = require('./db/connect')


// routers
// import authRoutes as authRouter in the app.js
const authRouter = require('./routes/authRoutes')

// middleware
// setup 404 and errorHandler middleware
const NotFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

// Morgan Package: know which routes you are hitting (development phase)
app.use(morgan('tiny'));
// setup express.json() middleware
// access json data in req.body
// 1
app.use(express.json());


// home page route
// 2 check for all routes
app.get('/', (req,res) => {
    res.send('AAC API')
})

// middleware for authentication routes
app.use('/api/v1/auth', authRouter)

// 3 no routes found: end up here
app.use(NotFoundMiddleware);
// last one, by express rules
// invoked from successful request, once existing route is hit
// when custom errors come into play
app.use(errorHandlerMiddleware);

// setup start port variable (4500) and start function
const port = process.env.PORT || 4500
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL)
        app.listen(port, console.log(`Server is listening on port ${port} ...`))
    } catch (error) {
        console.log(error)
    }
}

// restart the server
start();