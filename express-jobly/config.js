"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3000;

// Use dev database, testing database, or via env var, production database
function getDatabaseName() {
  return process.env.NODE_ENV === "test"
    ? "jobly_test"
    : process.env.DATABASE_URL || "jobly";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("Jobly Config:".green);
console.log("PORT:".yellow, PORT.toString());
console.log("Database Name:".yellow, getDatabaseName());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseName,
};
