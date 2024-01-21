const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", () => {
	it("should generate correct SQL query parts for single column update", () => {
		const result = sqlForPartialUpdate(
			{ name: "John Doe" },
			{ name: "name" }
		);

		expect(result).toEqual({
			setCols: '"name"=$1',
			values: ["John Doe"],
		});
	});

	it("should generate correct SQL query parts for multiple columns update", () => {
		const result = sqlForPartialUpdate(
			{ firstName: "Jane", lastName: "Doe", age: 30 },
			{ firstName: "first_name", lastName: "last_name" }
		);

		expect(result).toEqual({
			setCols: '"first_name"=$1, "last_name"=$2, "age"=$3',
			values: ["Jane", "Doe", 30],
		});
	});
});
