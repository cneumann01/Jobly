const { BadRequestError } = require("../expressError");


// Generates SQL query parts for partial update from input data and a mapping of the js variable name to the SQL column name.
// Example:
//     sqlForPartialUpdate({firstName: 'Aliya', age: 32}, {firstName: 'first_name'})
//     Returns: { setCols: '"first_name"=$1, "age"=$2', values: ['Aliya', 32] }

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
