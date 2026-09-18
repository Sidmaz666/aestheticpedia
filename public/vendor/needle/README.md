# Needle 3 engine (vendored)

`needle.js` and `needle.wasm` are the browser build of the Needle 3 inference engine from
[Cactus-Compute/needle3](https://huggingface.co/Cactus-Compute/needle3) (`wasm/` folder,
revision `9da75122d4ca11aa4a667281c9c8ba38a7eed679`), redistributed unmodified under the
Apache License 2.0 (see `LICENSE`).

The model weights (`needle3.cact`, ~35 MB) are not vendored: the browser downloads them from
Hugging Face at the same pinned revision and keeps them in Cache Storage. See
`src/lib/ai/needle.worker.ts`.
