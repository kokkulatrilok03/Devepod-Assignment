const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database/construction_erp.db');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    db.run('PRAGMA foreign_keys = ON');
  }
});

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const seedPath = path.join(__dirname, '../database/seed.sql');

    fs.readFile(schemaPath, 'utf8', (err, schema) => {
      if (err) {
        console.error('Error reading schema file:', err);
        return reject(err);
      }

      db.exec(schema, (err) => {
        if (err) {
          console.error('Error executing schema:', err);
          return reject(err);
        }

        console.log('Database schema initialized');

        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
          if (err) {
            console.error('Error checking users:', err);
            return reject(err);
          }

          if (row.count === 0) {
            fs.readFile(seedPath, 'utf8', (err, seed) => {
              if (err) {
                console.error('Error reading seed file:', err);
                return reject(err);
              }

              db.exec(seed, (err) => {
                if (err) {
                  console.error('Error executing seed:', err);
                  return reject(err);
                }

                console.log('Database seeded with initial data');
                resolve();
              });
            });
          } else {
            resolve();
          }
        });
      });
    });
  });
};
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  dbRun,
  dbGet,
  dbAll
};

