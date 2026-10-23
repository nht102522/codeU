const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";
const OUTPUT_LIMIT = 64 * 1024;

const decode = (chunks) => {
  const bytes = new Uint8Array(chunks.reduce((size, chunk) => size + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(bytes);
};

self.onmessage = async ({ data: { sourceCode, stdin } }) => {
  try {
    const { loadPyodide } = await import(/* @vite-ignore */ `${PYODIDE_URL}pyodide.mjs`);
    const pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
    const output = [];
    const stdout = [];
    const stderr = [];
    let outputSize = 0;
    let truncated = false;
    const capture = (stream, buffer) => {
      const remaining = OUTPUT_LIMIT - outputSize;
      if (buffer.length > remaining) truncated = true;
      if (remaining > 0) {
        // Emscripten reuses its buffers; copy the bytes before retaining them.
        const chunk = buffer.slice(0, remaining);
        stream.push(chunk);
        output.push(chunk);
        outputSize += chunk.length;
      }
      return buffer.length;
    };
    pyodide.setStdout({ write: (buffer) => capture(stdout, buffer) });
    pyodide.setStderr({ write: (buffer) => capture(stderr, buffer) });
    const input = new TextEncoder().encode(stdin);
    let inputOffset = 0;
    pyodide.setStdin({
      read: (buffer) => {
        const chunk = input.subarray(inputOffset, inputOffset + buffer.length);
        buffer.set(chunk);
        inputOffset += chunk.length;
        return chunk.length;
      },
    });

    // A real __main__ module supports normal script imports and doctest.testmod().
    // Compile as a script so bare expressions behave just like a Python file.
    const execute = pyodide.runPython(`
def _codeu_run(source):
    import sys, types, traceback
    main = types.ModuleType("__main__")
    main.__file__ = "main.py"
    sys.modules["__main__"] = main
    sys.argv = ["main.py"]
    out, err = sys.stdout, sys.stderr
    try:
        exec(compile(source, "main.py", "exec"), main.__dict__)
        return 0
    except SystemExit as error:
        if error.code is None:
            return 0
        if isinstance(error.code, int):
            return error.code
        print(error.code, file=err)
        return 1
    except BaseException as error:
        traceback.print_exception(type(error), error, error.__traceback__.tb_next, file=err)
        return 1
    finally:
        if not out.closed:
            out.flush()
        if not err.closed:
            err.flush()
_codeu_run
`);
    self.postMessage({ type: "ready" });
    let code;
    try {
      code = execute(sourceCode);
    } finally {
      execute.destroy();
    }
    const notice = truncated ? "\nOutput truncated after 64 KB.\n" : "";
    self.postMessage({
      type: "result",
      run: {
        stdout: decode(stdout),
        stderr: decode(stderr) + notice,
        output: decode(output) + notice,
        code: truncated && code === 0 ? 1 : code,
        signal: null,
      },
    });
  } catch {
    self.postMessage({
      type: "error",
      message: "Python could not load. Check your connection and try again.",
    });
  }
};
