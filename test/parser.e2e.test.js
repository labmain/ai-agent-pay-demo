const assert = require("assert");
const { parseCSV } = require("../src/parser");

function rowsToObjects(rows) {
  const [headers, ...records] = rows;
  return records.map(record => Object.fromEntries(headers.map((header, index) => [header, record[index]])));
}

function summarizeTransactions(records) {
  return records.reduce(
    (summary, record) => {
      const amount = Number(record.amount);
      summary.count += 1;
      summary.total += amount;
      summary.byCategory[record.category] = (summary.byCategory[record.category] || 0) + amount;
      return summary;
    },
    { count: 0, total: 0, byCategory: {} }
  );
}

const csv = [
  "date,category,amount,description",
  "2026-03-01,food,12.50,lunch",
  "2026-03-02,transport,3.25,metro",
  "2026-03-03,food,7.00,coffee",
].join("\n");

const parsed = parseCSV(csv);
const records = rowsToObjects(parsed);
const summary = summarizeTransactions(records);

assert.deepStrictEqual(records, [
  { date: "2026-03-01", category: "food", amount: "12.50", description: "lunch" },
  { date: "2026-03-02", category: "transport", amount: "3.25", description: "metro" },
  { date: "2026-03-03", category: "food", amount: "7.00", description: "coffee" },
]);
assert.deepStrictEqual(summary, {
  count: 3,
  total: 22.75,
  byCategory: { food: 19.5, transport: 3.25 },
});

const localizedCsv = "日期，分类，金额\n2026-03-01，餐饮，12.50\n2026-03-02，交通，3.25";
assert.deepStrictEqual(parseCSV(localizedCsv), [
  ["日期", "分类", "金额"],
  ["2026-03-01", "餐饮", "12.50"],
  ["2026-03-02", "交通", "3.25"],
]);

console.log("parser e2e tests passed");
