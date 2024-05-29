const express = require('express');
const server = express();
const imagesRouter = require('./routes/imageRoutes');

server.use(express.json());

server.use('/gallery', imagesRouter)

server.get('/', (req, res) => {
    res.send('server is up')
})


module.exports = server;