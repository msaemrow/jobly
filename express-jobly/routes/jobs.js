"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdminUser } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: logged in user has isAdmin permission
 */

router.post("/", ensureAdminUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { jobs: [ { title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters:
 * - salary
 * - equity
 * - company-handle (will find case-insensitive and partial matches)
 *
 * Authorization required: must be loggedin
 */

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const titleFilter = req.query.title;
    const salaryFilter = parseInt(req.query.salary);
    const equityFilter = req.query.equity === "true" ? true : false;
    let jobs;
    if (titleFilter && salaryFilter && equityFilter) {
      jobs = await Job.filterByTitleMinSalaryEquity(titleFilter, salaryFilter);
    } else if (titleFilter && salaryFilter) {
      jobs = await Job.filterByTitleAndMinSalary(titleFilter, salaryFilter);
    } else if (titleFilter && equityFilter) {
      jobs = await Job.filterByTitleAndEquity(titleFilter);
    } else if (salaryFilter && equityFilter) {
      jobs = await Job.filterByMinSalaryAndEquity(salaryFilter);
    } else if (titleFilter) {
      jobs = await Job.filterByTitle(titleFilter);
    } else if (salaryFilter) {
      jobs = await Job.filterByMinSalary(salaryFilter);
    } else if (equityFilter) {
      jobs = await Job.filterForEquity();
    } else {
      jobs = await Job.findAll();
    }
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

// /** GET /[id]  =>  { job }
//  *
//  *  Job is { title, salary, equity, company_handle }
//  *
//  * Authorization required: must be logged in
//  */

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

// /** PATCH /[id] { fld1, fld2, ... } => { job }
//  *
//  * Patches job data.
//  *
//  * fields can be: { title, salary, equity }
//  *
//  * Returns { id, title, salary, equity, company_handle }
//  *
//  * Authorization required: logged in user has isAdmin permission
//  */

router.patch("/:id", ensureAdminUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

// /** DELETE /[id]  =>  { deleted: "job id: id" }
//  *
//  * Authorization: logged in user has isAdmin permission
//  */

router.delete("/:id", ensureAdminUser, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: `job id: ${req.params.id}` });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
