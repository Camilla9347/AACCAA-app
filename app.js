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
const cookieParser = require('cookie-parser')

// database
// import connect() and invoke the starter
const connectDB = require('./db/connect')

//auth middleware
const {authenticateUser} = require('./middleware/authentication')


// routers
// import authRoutes as authRouter in the app.js
const authRouter = require('./routes/authRoutes')
const sentenceRouter = require('./routes/sentenceRoutes')


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
// once first request made and cookie got back
// then with each request, the browser will send that cookie (automatically to the server)
app.use(cookieParser(process.env.JWT_SECRET)); // sign cookies so client cannot tamper with them

// home page route
// 2 check for all routes
app.get('/', (req,res) => {
    res.send('AAC API')
})

app.get('/api/v1', (req,res) => {
    //console.log(req.cookies)
    // once cookie is signed, it is available from signedCookies
    console.log(req.signedCookies)
    res.send('AAC API')
})


// middleware for authentication routes
app.use('/api/v1/auth', authRouter)
// all  sentence routes require user to be authenticated
app.use('/api/v1/sentences',authenticateUser,sentenceRouter)



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