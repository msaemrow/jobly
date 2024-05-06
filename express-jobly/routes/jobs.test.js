"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const Job = require("../models/job");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */
describe("POST /jobs", function(){
    const newJob = {title: "testJob", salary: 1000, equity: 0.1, company_handle: "c1"};
    test("works for admin users", async () => {
        const res = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u2Token}`);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({job: {
            id: expect.any(Number),
            title: 'testJob',
            salary: 1000,
            equity: '0.1',
            company_handle: 'c1'
          }});
    });
    test("unauthorized for non-admin users", async () => {
        const res = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toBe(401);
    });
})

/************************************** GET /jobs */
describe("GET /jobs", function(){
    test("works for non admin users", async () =>{
        const res = await request(app)
            .get("/jobs")
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            jobs: expect.any(Array)
        })
    })
    test("filters jobs by title", async () =>{
        const res = await request(app)
            .get("/jobs?title=job")
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            jobs: [{
                id: expect.any(Number),
                title: "job1",
                salary: 1000,
                equity: "0.1",
                company_handle: "c1"
              }]
        })
    });
    test("filters jobs by salary", async () =>{
        const res = await request(app)
            .get("/jobs?salary=4000")
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            jobs: [{
                id: expect.any(Number),
                title: "test",
                salary: 5000,
                equity: "0",
                company_handle: "c2"
              }]
        })
    });
    test("filters jobs by equity", async () =>{
        const res = await request(app)
            .get("/jobs?equity=true")
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            jobs: [{
                id: expect.any(Number),
                title: "job1",
                salary: 1000,
                equity: "0.1",
                company_handle: "c1"
              }]
        })
    });
    test("unauthorized for anon users", async () =>{
        const res = await request(app)
            .get("/jobs?title=job")
        expect(res.statusCode).toBe(401);
    });
})

/************************************** GET /jobs/:id" */
describe("GET jobs/:id", function(){
    test("works for non admin user", async ()=> {
        const job1Result = await db.query(`SELECT * FROM jobs WHERE title='job1'`);
        const job1 = job1Result.rows[0];
        const res = await request(app)
            .get(`/jobs/${job1.id}`)
            .set("authorization", `Bearer ${u1Token}`)
        expect(res.body).toEqual({job: {
            id: expect.any(Number),
            title: "job1",
            salary: 1000,
            equity: "0.1",
            company_handle: "c1"
          }})
    });
    test("404 for non existent job id", async ()=> {
         const res = await request(app)
            .get(`/jobs/9999999`)
            .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toBe(404);
    });
    test("unauthorized for anon users", async ()=> {
        const job1Result = await db.query(`SELECT * FROM jobs WHERE title='job1'`);
        const job1 = job1Result.rows[0];
        const res = await request(app)
           .get(`/jobs/${job1.id}`)
       expect(res.statusCode).toBe(401);
   });
})

/************************************** PATCH /jobs/:id" */

describe("PATCH jobs/:id", function(){
    test("works for admin users", async () => {
        const job1Result = await db.query(`SELECT * FROM jobs WHERE title='test'`);
        const job1 = job1Result.rows[0];
        const res = await request(app)
            .patch(`/jobs/${job1.id}`)
            .send({
                title: "Best Job"
            })
            .set("authorization", `Bearer ${u2Token}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "Best Job",
                salary: 5000,
                equity: "0",
                company_handle: "c2"
              }
            });
        });
     test("unauthorized for non-admin users", async () => {
        const job1Result = await db.query(`SELECT * FROM jobs WHERE title='test'`);
        const job1 = job1Result.rows[0];
        const res = await request(app)
            .patch(`/jobs/${job1.id}`)
            .send({
                title: "Best Job"
            })
            .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toBe(401);
        });  
    test("unauthorized for anon users", async () => {
        const job1Result = await db.query(`SELECT * FROM jobs WHERE title='test'`);
        const job1 = job1Result.rows[0];
        const res = await request(app)
            .patch(`/jobs/${job1.id}`)
            .send({
                title: "Best Job"
            });
        expect(res.statusCode).toBe(401);
        });           
    })