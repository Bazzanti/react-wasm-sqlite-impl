import React, { useEffect, useState } from "react";
import "./App.css";
import sqlite3InitModule, { Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import WorkerComponent from "./Worker";

function App() {
  const [mainPre, setMainPre] = useState("");

  const start = function (sqlite3: Sqlite3Static) {
    console.log("Running SQLite3 version", sqlite3.version.libVersion);
    const db = new sqlite3.oo1.DB("/mydb.sqlite3", "ct");
    try {
      console.log("Creating a table...");
      db.exec("CREATE TABLE IF NOT EXISTS t(a,b)");
      console.log("Insert some data using exec()...");
      for (let i = 0; i <= 10; ++i) {
        db.exec({
          sql: `INSERT INTO t(a,b) VALUES (?,?)`,
          bind: [i, i * 2],
        });
      }
      console.log("Query data with exec()...");

      let value = "";

      db.exec({
        sql: "SELECT * FROM t ORDER BY b LIMIT 5",
        callback: (row) => {
          console.log(row);
          value += row[0] + "\n";
        },
      });
      setMainPre(value);
      console.log("End of main transactions.");
    } finally {
      db.close();
    }
  };

  useEffect(() => {
    console.log("Loading and initializing SQLite3 module...");
    sqlite3InitModule({
      print: console.log,
      printErr: console.error,
    }).then((sqlite3) => {
      try {
        console.log("Done initializing. Running demo...");
        start(sqlite3);
      } catch (err: any) {
        console.error(err.name, err.message);
      }
    });
  }, []);

  return (
    <div className="App">
      <div>
        <h1>Main thread</h1>
        {mainPre}
      </div>
      <WorkerComponent></WorkerComponent>
    </div>
  );
}

export default App;
