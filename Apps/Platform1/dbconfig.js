require("dotenv").config(); 
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const DB_USER=process.env.DB_USER
const DB_PASS=process.env.DB_PASS
const DB_HOST=process.env.DB_HOST
const DB_NAME=process.env.DB_NAME
const DB_PORT=process.env.DB_PORT

const conn = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`

const pool = new Pool ({
    user: 'postgres',
    host: 'localhost',
    database: 'userdb',
    password: 'postgres',
    port: 5432,
    ssl : false
})

module.exports =  pool ;
