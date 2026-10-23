import assert from "node:assert/strict";
import test from "node:test";
import { executePython } from "../src/runners/python.js";

// Exercise the browser runner's public promise contract without downloading
// Python. Worker events and time are controlled so failed runs can be checked
// for leaked workers, deadlines, and abort listeners.
const setup = (t, { postMessageError } = {}) => {
  const workers = [];
  const originalWorker = Object.getOwnPropertyDescriptor(globalThis, "Worker");

  class FakeWorker {
    constructor() {
      this.messages = [];
      this.terminationCount = 0;
      workers.push(this);
    }

    postMessage(message) {
      this.messages.push(message);
      if (workers.length === 1 && postMessageError) throw postMessageError;
    }

    terminate() {
      this.terminationCount += 1;
    }

    send(data) {
      this.onmessage({ data });
    }
  }

  Object.defineProperty(globalThis, "Worker", {
    value: FakeWorker,
    configurable: true,
    writable: true,
  });
  t.after(() => {
    if (originalWorker) Object.defineProperty(globalThis, "Worker", originalWorker);
    else delete globalThis.Worker;
  });
  t.mock.timers.enable({ apis: ["setTimeout"] });
  return workers;
};

const assertCanRunAgain = async (t, workers) => {
  const previousWorkers = workers.length;
  const nextRun = executePython('print("recovered")');
  assert.equal(workers.length, previousWorkers + 1, "recovery starts a fresh interpreter");
  const worker = workers.at(-1);
  worker.send({ type: "ready" });
  worker.send({
    type: "result",
    run: { stdout: "recovered\n", stderr: "", output: "recovered\n", code: 0 },
  });
  assert.equal((await nextRun).run.output, "recovered\n");
  t.mock.timers.tick(60000);
  for (const completedWorker of workers) {
    assert.equal(completedWorker.terminationCount, 1, "completed runs have no live worker or deadline");
  }
};

test("successful runs return output, forward stdin, and release their worker and abort listener", async (t) => {
  const workers = setup(t);
  const controller = new AbortController();
  const sourceCode = 'name = input()\nprint("Hello,", name)';
  const run = executePython(sourceCode, "Alex\n", { signal: controller.signal });
  assert.equal(workers.length, 1);
  assert.deepEqual(workers[0].messages, [{ sourceCode, stdin: "Alex\n" }]);

  const result = { stdout: "Hello, Alex\n\n", stderr: "", output: "Hello, Alex\n\n", code: 0 };
  workers[0].send({ type: "ready" });
  workers[0].send({ type: "result", run: result });
  assert.deepEqual(await run, { run: result });
  // A late event must not restart a completed run or terminate it twice.
  workers[0].send({ type: "ready" });
  workers[0].onmessageerror();
  controller.abort();
  t.mock.timers.tick(60000);
  assert.equal(workers[0].terminationCount, 1);
  await assertCanRunAgain(t, workers);
});

test("loading has a deadline and a timeout still allows a subsequent run", async (t) => {
  const workers = setup(t);
  const controller = new AbortController();
  let settled = false;
  const run = executePython("print(42)", "", { signal: controller.signal })
    .finally(() => { settled = true; });
  const rejection = assert.rejects(run, /Python could not load/);
  t.mock.timers.tick(59999);
  await Promise.resolve();
  assert.equal(settled, false, "a loading interpreter can use its full loading allowance");
  assert.equal(workers[0].terminationCount, 0);

  t.mock.timers.tick(1);
  await rejection;
  assert.equal(workers[0].terminationCount, 1);
  controller.abort();
  await assertCanRunAgain(t, workers);
});

test("ready replaces the loading deadline with ten seconds of execution time", async (t) => {
  const workers = setup(t);
  let settled = false;
  const run = executePython("while True: pass").finally(() => { settled = true; });
  const rejection = assert.rejects(run, /Execution stopped after 10 seconds/);
  t.mock.timers.tick(59000);
  workers[0].send({ type: "ready" });
  t.mock.timers.tick(9000);
  workers[0].send({ type: "ready" });
  t.mock.timers.tick(999);
  await Promise.resolve();
  assert.equal(settled, false, "the old loading deadline must not stop a ready interpreter");
  assert.equal(workers[0].terminationCount, 0);

  t.mock.timers.tick(1);
  await rejection;
  assert.equal(workers[0].terminationCount, 1);
  await assertCanRunAgain(t, workers);
});

test("an already aborted signal rejects without starting a worker", async (t) => {
  const workers = setup(t);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(executePython("print(42)", "", { signal: controller.signal }), {
    name: "AbortError",
  });
  assert.equal(workers.length, 0);
  await assertCanRunAgain(t, workers);
});

for (const phase of ["loading", "executing"]) {
  test(`Stop during ${phase} rejects with AbortError and frees the worker`, async (t) => {
    const workers = setup(t);
    const controller = new AbortController();
    const run = executePython("while True: pass", "", { signal: controller.signal });
    const rejection = assert.rejects(run, { name: "AbortError" });
    if (phase === "executing") workers[0].send({ type: "ready" });
    controller.abort();
    await rejection;
    assert.equal(workers[0].terminationCount, 1);
    await assertCanRunAgain(t, workers);
  });
}

for (const failure of [
  {
    name: "Python load failure",
    trigger: (worker) => worker.send({ type: "error", message: "Failed to download Python." }),
    message: /Failed to download Python/,
  },
  {
    name: "worker startup error",
    trigger: (worker, t) => {
      const preventDefault = t.mock.fn();
      worker.onerror({ preventDefault });
      assert.equal(preventDefault.mock.callCount(), 1);
    },
    message: /Python could not start/,
  },
  {
    name: "unreadable worker message",
    trigger: (worker) => worker.onmessageerror(),
    message: /Unable to read Python's output/,
  },
]) {
  test(`${failure.name} cleans up and permits recovery`, async (t) => {
    const workers = setup(t);
    const controller = new AbortController();
    const run = executePython("print(42)", "", { signal: controller.signal });
    const rejection = assert.rejects(run, failure.message);
    failure.trigger(workers[0], t);
    await rejection;
    assert.equal(workers[0].terminationCount, 1);
    controller.abort();
    await assertCanRunAgain(t, workers);
  });
}

test("a synchronous dispatch failure releases the worker and permits recovery", async (t) => {
  const workers = setup(t, { postMessageError: new Error("Worker dispatch failed.") });
  const controller = new AbortController();
  await assert.rejects(executePython("print(42)", "", { signal: controller.signal }), /Unable to start Python/);
  assert.equal(workers[0].terminationCount, 1);
  controller.abort();
  await assertCanRunAgain(t, workers);
});
