// Main-thread client for the OCaml toplevel worker.
//
// Protocol (see src/worker.ml):
//   page -> worker : postMessage(<OCaml source string>)
//   worker -> page : postMessage(["ready", banner])
//                    postMessage(["result", ok, stdout, stderr, result])
//                      ok     : "1" | "0"
//                      result : the toplevel's own echo, e.g. "- : int = 5"

const DEFAULT_CODE = `let rec fib n =
  if n < 2 then n else fib (n - 1) + fib (n - 2)

let () =
  for i = 0 to 10 do
    Printf.printf "fib %d = %d\\n" i (fib i)
  done
`;

const editor = document.getElementById('code');
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
    render(msg[1] === '1', msg[2], msg[3], msg[4]);
    setStatus('Done.');
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

function render(ok, stdout, stderr, result) {
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
  add(stdout, 'stdout');
  add(stderr, 'stderr');

  if (nodes.length === 0) {
    const span = document.createElement('span');
    span.className = 'placeholder';
    span.textContent = '(no output)';
    nodes.push(span);
  }

  output.replaceChildren(...nodes);
}

function run() {
  if (!ready || running) return;
  running = true;
  runButton.disabled = true;
  output.replaceChildren();
  setStatus('Running…');
  worker.postMessage(editor.value);
}

runButton.addEventListener('click', run);

editor.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    run();
  }
});
