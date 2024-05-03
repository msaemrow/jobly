"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when to ensure user is an admin
 *
 * If not, raises Unauthorized.
 */

function ensureAdminUser(req, res, next) {
  try {
    console.log("User:", res.locals.user);
    if (!res.locals.user) {
      console.log("Unauthorized: User not found");
      throw new UnauthorizedError();
    }
    if (!res.locals.user.isAdmin) {
      console.log("Unauthorized: User is not admin");
      throw new UnauthorizedError();
    }
    console.log("User is admin");
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when to ensure user is an admin or the same user as the route
 *
 * If not, raises Unauthorized.
 */
function ensureUserAuthorization(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError(); // Ensure user is logged in

    const isAdmin = res.locals.user.isAdmin;
    const isSameUser = req.params.username === res.locals.user.username;

    if (isAdmin || isSameUser) return next();
      
    throw new UnauthorizedError(); // Check if user is admin or same user


  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdminUser,
  ensureUserAuthorization
};
