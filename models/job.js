"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
	/** Create a job (from data), update db, return new job data.
	 *
	 * data should be { title, salary, equity, companyHandle }
	 *
	 * Returns { id, title, salary, equity, companyHandle }
	 *
	 * Throws BadRequestError if job already in database.
	 * */
	static async create({ title, salary, equity, companyHandle }) {
		const duplicateCheck = await db.query(
			`SELECT title
             FROM jobs
             WHERE title = $1 AND company_handle = $2`,
			[title, companyHandle]
		);

		if (duplicateCheck.rows[0]) {
			throw new BadRequestError(`Duplicate job: ${title}`);
		}

		const result = await db.query(
			`INSERT INTO jobs (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
			[title, salary, equity, companyHandle]
		);

		return result.rows[0];
	}

	/** Find all jobs.
	 *
	 * Returns [{ id, title, salary, equity, companyHandle }, ...]
	 * */
	static async findAll() {
		const result = await db.query(
			`SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs`
		);

		return result.rows;
	}

	/** Given a job id, return data about job.
	 *
	 * Returns { id, title, salary, equity, companyHandle }
	 *
	 * Throws NotFoundError if not found.
	 * */
	static async get(id) {
		const jobRes = await db.query(
			`SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             WHERE id = $1`,
			[id]
		);

		const job = jobRes.rows[0];

		if (!job) {
			throw new NotFoundError(`No job with id: ${id}`);
		}

		return job;
	}

	/** Update job data with `data`.
	 *
	 * This is a "partial update" --- it's fine if data doesn't contain all the
	 * fields; this only changes provided ones.
	 *
	 * Data can include: { title, salary, equity }
	 *
	 * Returns { id, title, salary, equity, companyHandle }
	 *
	 * Throws NotFoundError if not found.
	 */

	static async update(id, data) {
		// Check if job exists
		const jobCheck = await db.query(
			`SELECT id
           FROM jobs
           WHERE id = $1`,
			[id]
		);

		if (!jobCheck.rows[0]) {
			throw new NotFoundError(`No job with id: ${id}`);
		}

		// Generate the SQL for a partial update
		const { setCols, values } = sqlForPartialUpdate(data, {});
		const idVarIdx = "$" + (values.length + 1);

		// Execute the update query
		const querySql = `UPDATE jobs 
                          SET ${setCols} 
                          WHERE id = ${idVarIdx} 
                          RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
		const result = await db.query(querySql, [...values, id]);
		const job = result.rows[0];

		return job;
	}

	/** Delete given job from database; returns undefined.
	 *
	 * Throws NotFoundError if job not found.
	 **/
	static async remove(id) {
		const result = await db.query(
			`DELETE FROM jobs
            WHERE id = $1
            RETURNING id`,
			[id]
		);

		const job = result.rows[0];

		if (!job) {
			throw new NotFoundError(`No job with id: ${id}`);
		}
	}
}

module.exports = Job;
