// Keep Python independent of the authenticated, third-party Piston service.
export const executePython = (sourceCode, stdin = "", { signal } = {}) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Execution stopped.", "AbortError"));
      return;
    }

    // A fresh worker gives every run a clean interpreter and allows even an
    // infinite Python loop to be stopped without blocking the page.
    const worker = new Worker(new URL("./python.worker.js", import.meta.url), {
      type: "module",
    });
    let timer;
    let settled = false;
    let ready = false;

    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      worker.terminate();
      if (error) reject(error);
      else resolve(result);
    };
    const abort = () =>
      finish(new DOMException("Execution stopped.", "AbortError"));
    const deadline = (milliseconds, message) => {
      clearTimeout(timer);
      timer = setTimeout(() => finish(new Error(message)), milliseconds);
    };

    signal?.addEventListener("abort", abort, { once: true });
    deadline(60000, "Python could not load. Check your connection and try again.");
    worker.onmessage = ({ data }) => {
      if (settled) return;
      if (data.type === "ready" && !ready) {
        ready = true;
        deadline(10000, "Execution stopped after 10 seconds. Check for an infinite loop.");
      } else if (data.type === "result") {
        finish(null, { run: data.run });
      } else if (data.type === "error") {
        finish(new Error(data.message));
      }
    };
    worker.onerror = (event) => {
      event.preventDefault();
      finish(new Error("Python could not start. Check your connection and try again."));
    };
    worker.onmessageerror = () => finish(new Error("Unable to read Python's output. Try again."));
    try {
      worker.postMessage({ sourceCode, stdin });
    } catch {
      finish(new Error("Unable to start Python. Please try again."));
    }
  });
