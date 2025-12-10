export const ADDITEMS = `  
INSERT INTO tallyDetail (
    uuid,
    bankShort,
    startDate,
    endDate,
    cashRate,
    extraRate,
    totalRate,
    amount,
    ext
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

export const CREATTABLE = `
CREATE TABLE IF NOT EXISTS tallyDetail (
    uuid TEXT PRIMARY KEY,
    bankShort TEXT,
    startDate TEXT,
    endDate TEXT,
    cashRate TEXT,
    extraRate TEXT,
    totalRate TEXT,
    amount TEXT,
    ext TEXT
);
`;

export const QUERYALL = `
SELECT * FROM tallyDetail;
`;

export const DELETEITEM = `
DELETE FROM tallyDetail WHERE uuid = ?;
`;
