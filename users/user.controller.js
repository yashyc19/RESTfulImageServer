const express = require('express');
const router = express.Router()
const userService = require('./user.services')

module.exports = router;

// REST APIs
// API that registers the user
router.post('/register', function (req, res) {
    userService.registerUser(req.body)
        .then(u => res.json(u))
        .catch(err => res.status(400).json({ message: err }));
})

// API that checks if the user is in the database
// If the user is found, then it returns the user data along with the token
router.post('/login', function (req, res, next) {
    userService.authenticate(req.body)
        // If user is returned then login was successfull, return the token along with user data (WITHOUT PASSWORD)
        .then(userWithToken => userWithToken ? res.json(userWithToken) : res.status(400).json({ message: 'Username or password is incorrect' }))
        // Else run next `CALLBACK` (which is going to be a passed function)
        .catch((err) => {
            console.log(err);
            next(err)
        });
})

// API that returns all users
router.get('/users', function (req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
})

// API that returns a specific user
router.get('/users/:userId', function (req, res, next) {
    let userId = parseInt(req.params.userId)
    console.log("Requesting user " + userId)
    userService.getUser(userId)
        .then(users => res.json(users))
        .catch(err => next(err));
})

// API endpoint / that checks if the server is running
router.get('/', function (req, res) {
    res.status(200).send({ message: "Server is running"});
})