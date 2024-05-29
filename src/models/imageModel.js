const db = require('../db.json')

function get() {
    return db()
}

module.exports = {get}