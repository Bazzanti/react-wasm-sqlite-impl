import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

const log = (...args) => postMessage({type: 'log', payload: args.join(' ')});
const error = (...args) => postMessage({type: 'error', payload: args.join(' ')});
const result = (...args) => postMessage({type: 'result', payload: args.join(' ')});

const add = function (db, newValue) {
  try {
    log('Insert some data using exec()...');
    db.exec({
        sql: 'INSERT INTO z(a,b) VALUES (?,?)',
        bind: [newValue, newValue*3],
    });
    log('Query data with exec()...');

    let value = "";

    db.exec({
      sql: 'SELECT * FROM z ORDER BY b ',
      callback: (row) => {
        log("row",row);
        value += row[0] + "\n";
      },
    });

    result(value);
    log("End of add transactions.");
  } finally {
    db.close();
  }
};

const cleanTable = function (db) {
    try {
      log('Clean Table using exec()...');
      db.exec('DELETE FROM z');
  
      result(null);
      log("End of add transactions.");
    } finally {
      db.close();
    }
  };

log('Loading and initializing Worker Add SQLite3 module...');
sqlite3InitModule({
  print: log,
  printErr: error,
}).then((sqlite3) => {
  log('Done initializing. Running...');


  self.onmessage = (e) => {
    log('Running SQLite3 version', sqlite3.version.libVersion);

    let db;
  
    if ('opfs' in sqlite3) {
      db = new sqlite3.oo1.OpfsDb('/mydb.sqlite3');
      log('OPFS is available, created persisted database at', db.filename);
    } else {
      db = new sqlite3.oo1.DB('/mydb.sqlite3', 'ct');
      log('OPFS is not available, created transient database', db.filename);
    }

    log('Worker message.', JSON.stringify(e));

    try{
      switch (e.data.type) {
        case 'add':
          add(db, e.data.payload);
          break;
        case 'clean':
          cleanTable(db);
          break;
        default:
          error('Unknown message type', e.data.type);
      }
    }catch (err) {
      error(err.name, err.message);
    }

  };

});