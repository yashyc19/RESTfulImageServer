const config = require('config.json');
const path = require('path')
const jwt = require('jsonwebtoken')
const express = require('express');
const router = express.Router()
const imageService = require('./image.services')

module.exports = router;

// All endpoints are routed through /images as base URL
// API to get all the images
router.get("/", function (req, res, next) {
    const usertoken = req.headers.authorization;
    const token = usertoken.split(' ');
    jwt.verify(token[1], config.secret, (err, decoded) => {
        if (err) return next(err); // Pass errors to the next middleware
        imageService.getAll()
            .then(images => res.json(images))
            .catch(next); // Pass any errors to the next middleware
    });
});

// API to upload the image
router.post("/uploadImage", function (req, res, next) {
    const usertoken = req.headers.authorization;
    const token = usertoken.split(' ');
    jwt.verify(token[1], config.secret, (err, decoded) => {
        if (err) return next(err); // Pass errors to the next middleware
        console.log(decoded);
        imageService.uploadImage(decoded.sub, req.files)
            .then(data => res.json(data))
            .catch(next); // Pass any errors to the next middleware
    });
});

router.get("/search", function (req, res, next) {
    let queryUserId = req.body.user
    const usertoken = req.headers.authorization;
    const token = usertoken.split(' ');
    jwt.verify(token[1], config.secret, (err, decoded) => {
        if (err) return next(err); // Pass errors to the next middleware
        imageService.getImagesOfUserWithId(queryUserId)
            .then((images) => res.json(images))
            .catch(next); // Pass any errors to the next middleware
    });
});

// api endpoint to save the images that are selected by the user
// the user will send a raw body json with the image ids
router.post("/saveSelected", function (req, res, next) {
    const usertoken = req.headers.authorization;
    const token = usertoken.split(' ');
    jwt.verify(token[1], config.secret, (err, decoded) => {
        if (err) return next(err); // Pass errors to the next middleware
        imageService.saveSelectedImages(decoded.sub, req.body)
            .then(data => {
                res.json(data)
            })
            .catch(next); // Pass any errors to the next middleware
    });
});

// api endpoint to get the images that are selected by the user
router.get("/getSelected", function (req, res, next) {
    const usertoken = req.headers.authorization;
    const token = usertoken.split(' ');
    jwt.verify(token[1], config.secret, (err, decoded) => {
        if (err) return next(err); // Pass errors to the next middleware
        imageService.getSelectedImages(decoded.sub)
            .then(data => {
                res.json(data)
            })
            .catch(next); // Pass any errors to the next middleware
    });
});

router.get("/:imageId", function (req, res, next) {
    let imageId = req.params.imageId;

    var options = {
        root: path.join(__dirname, '../'),
        dotfiles: 'deny',
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
      }

    imageService.getImage(imageId)
        .then(image => {
            // res.sendFile and manage the folder structure
            if (image.status === 404) {
                res.status(404).json({ message : "Image not found." });
                return;
            }
            res.sendFile(image, options, (err) => {
                if (err) {
                    res.status(500).json({ message : "Server was unable to retrieve the image." });
                }
            });
        })
        .catch(err => res.status(400).json({ message : err }));
});