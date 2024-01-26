"use strict";

const db = require("../db.js");
const Job = require("./job.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
} = require("./_testCommon");

async function fetchJobId() {
	const res = await db.query(`SELECT * FROM jobs`);
	return res.rows[0].id;
}

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe("create", function () {
	const newJob = {
		title: "New Job",
		salary: 50000,
		equity: "0.05",
		companyHandle: "c1",
	};

	test("works", async function () {
		let job = await Job.create(newJob);
		expect(job).toEqual({
			id: expect.any(Number),
			title: "New Job",
			salary: 50000,
			equity: "0.05",
			companyHandle: "c1",
		});

		const result = await db.query(
			`SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE title = 'New Job'`
		);
		expect(result.rows).toEqual([
			{
				id: expect.any(Number),
				title: "New Job",
				salary: 50000,
				equity: "0.05",
				companyHandle: "c1",
			},
		]);
	});

	test("bad request with dupe", async function () {
		await Job.create(newJob);
		await expect(Job.create(newJob)).rejects.toThrow(BadRequestError);
	});
});

/************************************** findAll */
describe("findAll", function () {
	test("works: no filter", async function () {
		let jobs = await Job.findAll();
		expect(jobs).toEqual([
			{
				id: expect.any(Number),
				title: "Job1",
				salary: 100,
				equity: "0.1",
				companyHandle: "c1",
			},
			{
				id: expect.any(Number),
				title: "Job2",
				salary: 200,
				equity: "0",
				companyHandle: "c1",
			},
		]);
	});

	// Additional tests for filtering (if implemented)
});

/************************************** get */
describe("get", function () {
	test("works", async function () {
		let job = await Job.get(await fetchJobId());
		expect(job).toEqual({
			id: expect.any(Number),
			title: "Job1",
			salary: 100,
			equity: "0.1",
			companyHandle: "c1",
		});
	});

	test("not found if no such job", async function () {
		await expect(Job.get(0)).rejects.toThrow(NotFoundError);
	});
});

/************************************** update */
describe("update", function () {
	const updateData = {
		title: "Updated Job",
		salary: 60000,
		equity: "0",
	};

	test("works", async function () {
		let job = await Job.update(await fetchJobId(), updateData);
		expect(job).toEqual({
			id: expect.any(Number),
			...updateData,
			companyHandle: "c1",
		});
	});

	test("not found if no such job", async function () {
		await expect(Job.update(0, updateData)).rejects.toThrow(NotFoundError);
	});
});

/************************************** remove */
describe("remove", function () {
	test("works", async function () {
		await Job.remove(await fetchJobId());
		const res = await db.query("SELECT id FROM jobs WHERE id = $1", [1]);
		expect(res.rows.length).toEqual(0);
	});

	test("not found if no such job", async function () {
		await expect(Job.remove(0)).rejects.toThrow(NotFoundError);
	});
});
