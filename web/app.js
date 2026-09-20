// Main-thread client for the OCaml toplevel worker.
//
// Protocol (see src/worker.ml):
//   page -> worker : postMessage({ code, input, args, files })
//                      input becomes the program's stdin
//                      args become Sys.argv (argv.(0) is "main.ml")
//                      files are registered so open_in finds them
//   worker -> page : postMessage(["ready", banner])
//                    postMessage(["result", exitCode, stdout, stderr, result])
//                      exitCode : 0 on success, non-zero on failure
//                      result   : the toplevel's own echo, e.g. "- : int = 5"

const DEFAULT_CODE = `let rec fib n =
  if n < 2 then n else fib (n - 1) + fib (n - 2)

let () =
  for i = 0 to 10 do
    Printf.printf "fib %d = %d\\n" i (fib i)
  done
`;

const editor = document.getElementById('code');
const stdinEditor = document.getElementById('stdin');
const argsEditor = document.getElementById('args');
const filesEditor = document.getElementById('files');
const output = document.getElementById('output');
const status = document.getElementById('status');
const runButton = document.getElementById('run');

editor.value = DEFAULT_CODE;

let ready = false;
let running = false;

const worker = new Worker('./worker.js');

worker.addEventListener('message', (event) => {
  const msg = event.data;

  if (msg[0] === 'ready') {
    ready = true;
    setStatus(msg[1]);
    return;
  }

  if (msg[0] === 'result') {
    running = false;
    runButton.disabled = false;
    const exitCode = Number(msg[1]);
    render(exitCode, msg[2], msg[3], msg[4]);
    setStatus(
      exitCode === 0 ? 'Done.' : `Exited with code ${exitCode}.`,
      exitCode !== 0,
    );
  }
});

worker.addEventListener('error', (event) => {
  running = false;
  runButton.disabled = false;
  setStatus('Worker error: ' + (event.message || 'failed to load'), true);
});

function setStatus(text, isError) {
  status.textContent = text;
  status.classList.toggle('error', Boolean(isError));
}

function render(exitCode, stdout, stderr, result) {
  const ok = exitCode === 0;
  const nodes = [];
  const add = (text, cls) => {
    if (!text) return;
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = text;
    nodes.push(span);
  };

  // The toplevel's own output: the value of the phrase, or the error message.
  add(result, ok ? 'result' : 'stderr');

  // stderr carries both diagnostics and warnings. Colour them apart so a
  // warning does not look like a failure, matching the exit code. A location
  // line belongs to whatever diagnostic follows it.
  const lines = stderr.split('\n').filter((line) => line !== '');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const forSeverity = /^(Line|File|Characters)/.test(line) ? lines[i + 1] : line;
    add(line + '\n', /^Warning/.test(forSeverity ?? '') ? 'warning' : 'stderr');
  }

  add(stdout, 'stdout');

  if (nodes.length === 0) {
    const span = document.createElement('span');
    span.className = 'placeholder';
    span.textContent = '(no output)';
    nodes.push(span);
  }

  output.replaceChildren(...nodes);
}

// Command-line arguments, whitespace separated.
const parseArgs = (text) => text.split(/\s+/).filter(Boolean);

// Files: each begins with a "--- name" marker, contents run to the next one.
const parseFiles = (text) => {
  const files = [];
  let current = null;
  for (const line of text.split('\n')) {
    const marker = /^---\s*(.+?)\s*$/.exec(line);
    if (marker) {
      current = { name: marker[1], content: '' };
      files.push(current);
    } else if (current) {
      current.content += line + '\n';
    }
  }
  return files;
};

function run() {
  if (!ready || running) return;
  running = true;
  runButton.disabled = true;
  output.replaceChildren();
  setStatus('Running…');
  worker.postMessage({
    code: editor.value,
    input: stdinEditor.value,
    args: parseArgs(argsEditor.value),
    files: parseFiles(filesEditor.value),
  });
}

runButton.addEventListener('click', run);

editor.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    run();
  }
});
