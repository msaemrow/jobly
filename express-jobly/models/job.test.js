"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "testJob",
    salary: 1000,
    equity: 0.1,
    company_handle: "c1"
  };

  test("creates new job in db", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
        id: expect.any(Number),
        title: "testJob",
        salary: 1000,
        equity: "0.1",
        company_handle: "c1"
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${job.id}`);
    expect(result.rows).toEqual([
        {
            id: expect.any(Number),
            title: "testJob",
            salary: 1000,
            equity: "0.1",
            company_handle: "c1"
        }
    ]);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("finds all jobs: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job1",
        salary: 1000,
        equity: "0.1",
        company_handle: "c1"
      },
      {
        id: expect.any(Number),
        title: "job2",
        salary: 2000,
        equity: "0.2",
        company_handle: "c2"
      },
      {
        id: expect.any(Number),
        title: "job3",
        salary: 3000,
        equity: "0.3",
        company_handle: "c3"
      },
    ]);
  });
});

// /************************************** get (jobId) */ 

describe("get", function () {
  test("find single job", async function () {
    const newJob = { title: "Test Job", salary: 50000, equity: 0.05, company_handle: "c1" };
    const createdJob = await Job.create(newJob);
    const jobId = createdJob.id; // 

    let job = await Job.get(jobId);
    expect(job).toEqual({
        id: expect.any(Number),
        title: "Test Job",
        salary: 50000,
        equity: "0.05",
        company_handle: "c1"
    });
  });

  test("not found if no such job exists", async function () {
    try {
      await Job.get(999999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** update(jobId) */

describe("update", function () {
  const updateJob = {
    title: "testJob",
    salary: 19000,
    equity: 0.9,
  };

  test("updates job data properly", async function () {
    const jobs = await Job.findAll();
    const jobOneId = jobs[0].id
    let job = await Job.update(jobOneId, updateJob);
    expect(job).toEqual({
        id: jobOneId,
        title: "testJob",
        salary: 19000,
        equity: "0.9",
        company_handle: "c1"
      });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${jobOneId}`);
    expect(result.rows).toEqual([{
        id: jobOneId,
        title: "testJob",
        salary: 19000,
        equity: "0.9",
        company_handle: "c1"
      }]);
  });
});

  test("works: null fields", async function () {
    const jobs = await Job.findAll();
    const jobOneId = jobs[0].id
    const updateDataSetNulls = {
        salary: null,
        equity: null,
      };

    let job = await Job.update(jobOneId, updateDataSetNulls);
    expect(job).toEqual({
        id: jobOneId,
        title: "job1",
        salary: null,
        equity: null,
        company_handle: "c1"
      });

    const result = await db.query(
        `SELECT id, title, salary, equity, company_handle
         FROM jobs
         WHERE id = ${jobOneId}`);
    expect(result.rows).toEqual([{
        id: jobOneId,
        title: "job1",
        salary: null,
        equity: null,
        company_handle: "c1"
      }]);
  });

  test("not found if no such company", async function () {
    try {
        const updateData = {
            salary: null,
            equity: null,
          };
    
      await Job.update(999999, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      const jobs = await Job.findAll();
      const jobOneId = jobs[0].id
      await Job.update(jobOneId, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    const jobs = await Job.findAll();
    const jobOneId = jobs[0].id
    await Job.remove(jobOneId);
    const res = await db.query(
        `SELECT ${jobOneId} FROM jobs WHERE id=${jobOneId}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove(9999999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
