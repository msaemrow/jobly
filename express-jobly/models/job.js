"use strict";

const { query } = require("express");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Allows for duplicate jobs to be created but each will have different ID
   * */

  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(
        `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle`,
              [title, salary, equity, company_handle]
    )
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           ORDER BY title`);
    return jobsRes.rows;
  }

  /** Given a job id, return data about that job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if job is not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job with ID: ${id}`);

    return job;
  }

    /** Given a title query, return data about companies that contain the title query.
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   **/
  static async filterByTitle(title) {
    const jobsRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle
       FROM jobs
       WHERE LOWER(title) LIKE '%' || $1 || '%'`,
      [title.toLowerCase()]
    );
    return jobsRes.rows;
  }

      /** Given a minSalary, return data about companies are > than minSalary.
   *
   * Returns {id, title, salary, equity, company_handle }
   *
   **/
      static async filterByMinSalary(minSalary){
        let jobsRes = await db.query(`SELECT id,
                            title,
                            salary,
                            equity,
                            company_handle
                     FROM jobs
                     WHERE salary >= $1`,
                    [minSalary])

        return jobsRes.rows;
      }

    /** Given a minSalary and title, return data about companies meet both queries.
   *
   * Returns {id, title, salary, equity, company_handle }
   *
   **/
    static async filterByTitleAndMinSalary(title, minSalary){
        let jobsRes = await db.query(`SELECT id,
                            title,
                            salary,
                            equity,
                            company_handle
                        FROM jobs
                        WHERE LOWER(title) LIKE '%' || $1 || '%' AND salary >= $2`,
                    [title, minSalary])

        return jobsRes.rows;
        }

    /** Given an true equity query, return data about companies meet provide equity.
   *
   * Returns {id, title, salary, equity, company_handle }
   *
   **/
    static async filterForEquity(){
        let jobsRes = await db.query(`SELECT id,
                            title,
                            salary,
                            equity,
                            company_handle
                        FROM jobs
                        WHERE equity IS NOT NULL AND equity != $1`,
                    [0])

        return jobsRes.rows;
        }

    /** Given a minSalary, title, and true equity query return data about companies meet all queries.
   *
   * Returns {id, title, salary, equity, company_handle }
   *
   **/
    static async filterByTitleMinSalaryEquity(title, minSalary){
        let jobsRes = await db.query(`SELECT id,
                            title,
                            salary,
                            equity,
                            company_handle
                        FROM jobs
                        WHERE LOWER(title) LIKE '%' || $1 || '%' AND salary >= $2 AND equity IS NOT NULL AND equity != $3`,
                    [title, minSalary, 0])

        return jobsRes.rows;
        }        

    /** Given a minSalary and true equity query return data about companies meet all queries.
   *
   * Returns {id, title, salary, equity, company_handle }
   *
   **/
    static async filterByMinSalaryAndEquity(minSalary){
        let jobsRes = await db.query(`SELECT id,
                            title,
                            salary,
                            equity,
                            company_handle
                        FROM jobs
                        WHERE salary >= $1 AND equity IS NOT NULL AND equity != $2`,
                    [minSalary, 0])

        return jobsRes.rows;
        } 

    /** Given a title and true equity query return data about companies meet all queries.
   *
   * Returns {id, title, salary, equity, company_handle }
   *
   **/
    static async filterByTitleAndEquity(title){
        let jobsRes = await db.query(`SELECT id,
                            title,
                            salary,
                            equity,
                            company_handle
                        FROM jobs
                        WHERE LOWER(title) LIKE '%' || $1 || '%' AND equity IS NOT NULL AND equity != 0`,
                    [title])

        return jobsRes.rows;
        } 


    /** Given a minSalary and true equity query return data about companies meet all queries.
   *
   * Returns {id, title, salary, equity, company_handle }
   *
   **/
    static async getByCompanyHandle(companyHandle) {
        const result = await db.query(
          `SELECT id, title, salary, equity
           FROM jobs
           WHERE company_handle = $1`,
          [companyHandle]
        );
        return result.rows;
      }
      
  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          title: "title",
          salary: "salary",
          equity: "equity"
        });
    const idIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
                      SET ${setCols} 
                      WHERE id = ${idIdx} 
                      RETURNING id, title, salary, equity, company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (job === undefined) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job is not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with ID: ${id}`);
  }
}


module.exports = Job;
