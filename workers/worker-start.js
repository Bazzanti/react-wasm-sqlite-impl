import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

const log = (...args) => postMessage({type: 'log', payload: args.join(' ')});
const error = (...args) => postMessage({type: 'error', payload: args.join(' ')});
const result = (...args) => postMessage({type: 'result', payload: args.join(' ')});

const start = function (sqlite3) {
  log('Running SQLite3 version', sqlite3.version.libVersion);
  let db;
  if ('opfs' in sqlite3) {
    db = new sqlite3.oo1.OpfsDb('/mydb.sqlite3');
    log('OPFS is available, created persisted database at', db.filename);
  } else {
    db = new sqlite3.oo1.DB('/mydb.sqlite3', 'ct');
    log('OPFS is not available, created transient database', db.filename);
  }
  try {
    log('Creating a table...');
    db.exec('CREATE TABLE IF NOT EXISTS z(a,b)');

    log('Insert some data using exec()...');
    for (let i = 10; i <= 15; ++i) {
      db.exec({
        sql: 'INSERT INTO z(a,b) VALUES (?,?)',
        bind: [i, i * 3],
      });
    }
    log('Query data with exec()...');

    let value = "";

    db.exec({
      sql: 'SELECT * FROM z ORDER BY b LIMIT 25',
      callback: (row) => {
        log("row",row);
        value += row[0] + "\n";
      },
    });

    result(value);
    log("End of main transactions.");
  } finally {
    db.close();
  }
};

log('Loading and initializing Worker Start SQLite3 module...');
sqlite3InitModule({
  print: log,
  printErr: error,
}).then((sqlite3) => {
  log('Done initializing. Running demo...');
  try {
    start(sqlite3);
  } catch (err) {
    error(err.name, err.message);
  }
});