import React, { useEffect, useState } from "react";

function WorkerComponent() {
  const workerUpdate = new Worker("./workers/worker-update.js", {
    type: "module",
  });

  useEffect(() => {
    const worker = new Worker("./workers/worker-start.js", { type: "module" });
    worker.onmessage = (e) => {
      switch (e.data.type) {
        case "log":
          console.log("log:", e.data.payload);
          break;
        case "error":
          console.error(e.data.payload);
          break;
        case "result":
          console.log("result", e.data.payload);
          setWorkerPre(e.data.payload);
          break;
      }
    };
  }, []);

  workerUpdate.onmessage = (e) => {
    switch (e.data.type) {
      case "log":
        console.log("log:", e.data.payload);
        break;
      case "error":
        console.error(e.data.payload);
        break;
      case "result":
        console.log("result", e.data.payload);
        setWorkerPre(e.data.payload);
        break;
    }
  };

  const [workerPre, setWorkerPre] = useState("");

  const onClean = () => {
    console.log("clean");
    workerUpdate.postMessage({ type: "clean" });
  };

  const onAdd = () => {
    const randomValue = Math.floor(Math.random() * 100);
    console.log("add", randomValue);
    workerUpdate.postMessage({ type: "add", payload: randomValue });
  };

  return (
    <div>
      <h1>Worker thread</h1>
      <div>
        <button onClick={onClean}>Clean</button>
        <button onClick={onAdd}>Add</button>
      </div>
      {workerPre}
    </div>
  );
}

export default WorkerComponent;
