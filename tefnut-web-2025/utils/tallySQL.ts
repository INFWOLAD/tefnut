export const ADD_ITEMS = `INSERT INTO tallyDetail (uuid, bankShort, startDate, endDate, cashRate, extraRate, totalRate, amount, ext) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

export const UPDATE_ITEMS = `UPDATE tallyDetail SET bankShort = ?, startDate = ?, endDate = ?, cashRate = ?, extraRate = ?, totalRate = ?, amount = ?, ext = ? WHERE uuid = ?;`;

export const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS tallyDetail (uuid TEXT PRIMARY KEY, bankShort TEXT, startDate TEXT, endDate TEXT, cashRate TEXT, extraRate TEXT, totalRate TEXT, amount TEXT, ext TEXT);`;

export const QUERY_ALL = `SELECT * FROM tallyDetail;`;

export const DELETE_ITEM = `DELETE FROM tallyDetail WHERE uuid = ?;`;

export const LIST_VIA_BANK = `SELECT * FROM tallyDetail WHERE bankShort = ?;`;
