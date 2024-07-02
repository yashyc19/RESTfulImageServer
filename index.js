require('rootpath')(); // Sets the base path for module resolution
const express = require('express'); // Imports the Express.js framework
const cors = require('cors'); // Enables Cross-Origin Resource Sharing
const jwt = require('./utils/jwt'); // Custom JWT authentication middleware
const errorHandler = require('./utils/error_handler'); // Custom error handling middleware
const bodyParser = require("body-parser"); // Parses incoming request bodies
const fileupload = require('express-fileupload'); // Handles multipart/form-data, file uploads
const app = express();

const serverPort = process.env.PORT || 5000;

// Define CORS options
const corsOptions = {
    origin: '*', // Allow all origins
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(bodyParser.urlencoded({ extended: true })); // Parses the text as URL encoded data
app.use(bodyParser.json()); // Parses the text as JSON

// Apply CORS middleware with the defined options
app.use(cors(corsOptions));

app.use(fileupload({    // Enables file uploads
    useTempFiles : true,    // Uses the OS's temporary directory for storing files
    tempFileDir : './tmp/'  // Specifies the temporary directory
}))
app.use(jwt()); // Uses the custom JWT authentication middleware

app.use('/', require('./users/user.controller'));   // User-related routes
app.use('/images', require('./users/image.controller'));    // Image-related routes
app.use(errorHandler);  // Uses the custom error handling middleware, uses the next(err) ladder to catch errors centrally

app.set("port", serverPort);

/* Start the server on port 5000 */
app.listen(serverPort, function () {
    console.log(`Your app is ready at port ${serverPort}`);
});