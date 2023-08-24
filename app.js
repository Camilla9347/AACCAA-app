// store MONGO_DB, JWT, AWS, CLOUDINARY keys
require('dotenv').config();

// apply try-catch automatically to all controllers
require('express-async-errors')

// extra security packages
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

// Setup Basic Express Server
const express = require('express');
const app = express();

// rest of the packages
//const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const AWS = require('aws-sdk')

// suppress AWS warning
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

AWS.config.credentials = new AWS.Credentials(
    process.env.AWS_ACCESS_KEY, // Your access key ID
    process.env.AWS_SECRET_KEY, // Your secret access key
);
AWS.config.region = "eu-north-1";

const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

// database
// import connect() and invoke the starter
const connectDB = require('./db/connect')

//auth middleware
const {authenticateUser} = require('./middleware/authentication')

// routers
const authRouter = require('./routes/authRoutes')
const sentenceRouter = require('./routes/sentenceRoutes')

// middleware
const NotFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

app.set('trust proxy',1);
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    })
);

// Morgan Package: know which routes you are hitting (development phase)
//app.use(morgan('tiny'));

// setup express.json() middleware
// access json data in req.body
// 1
app.use(express.json());

app.use(helmet());
app.use(cors());
app.use(xss());

// once first request made and cookie got back
// then with each request, the browser will send that cookie (automatically to the server)
app.use(cookieParser(process.env.JWT_SECRET)); // sign cookies so client cannot tamper with them

// home page route
// 2 check for all routes

app.get('/', (req,res) => {
    res.send('AACCAA')
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