const db = require('../db.json')

function get() {
    return db('images')
}

module.exports = {get}