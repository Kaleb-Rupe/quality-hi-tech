const server = require('./src/server');

const port = process.env.port;

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
});