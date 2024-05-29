require('dotenv').config()

const server = require('./src/server');

const PORT = process.env.SERVER_PORT;

server.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`)
});