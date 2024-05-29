const express = require('express');
const Image = require('../models/imageModel');

const router = express.Router();

router.get('/gallery', (req, res, next) => {
    Image.get()
    .then(image => {
        res.json(image)
    })
    .catch(next)
})

router.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        customMessage: "something didn't work right in the images router",
        message: err.message,
        stack: err.stack
    })
})

module.exports = router;