"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseName } = require("./config");
require('dotenv').config();


const db = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: getDatabaseName()
});

db.connect();

module.exports = db;