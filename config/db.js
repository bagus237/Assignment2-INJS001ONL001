const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'db_latihan',
    password: 'Tengil48!',
    port: 5432
})

console.log('connect to database')

module.exports = pool