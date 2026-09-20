# Taste
- Prefers to start a new feature with a minimal, self-contained proof-of-concept (e.g. a simple standalone HTML page) to validate the approach before building the full integration. Confidence: 0.65
- Prefers fully client-side / serverless solutions: work should run in the browser with no servers or backend. Confidence: 0.7
- Expects new integrations to honor the framework's existing conventions and contracts rather than merely work in isolation — e.g. a new language runtime must support the same interop surface as existing ones (stdin, stdout, stderr, compiler diagnostics, exit code). Confidence: 0.5
- Insists that public-facing names and labels accurately describe what a feature actually is; would rather replace or remove a misleading offering than keep it for compatibility, especially when it risks confusing users. Confidence: 0.6
- Wants an online playground/sandbox to closely mirror the real local development environment — i.e. emulate how developers actually work in practice (the common `dune build && dune exec` + stdin/stdout/exit-code loop) rather than adding capabilities that only serve a narrow, uncommon workflow. Confidence: 0.7
- When weighing a new technology or implementation against an existing one, wants an explicit advantages/disadvantages comparison (grounded in the actual existing code) before a recommendation, not a bare verdict. Confidence: 0.55
