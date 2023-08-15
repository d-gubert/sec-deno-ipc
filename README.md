
# sec-deno-ipc

A study of IPC between Node <-> Deno, Deno Web Workers, and other potential features that aid sub process management - with a focus on discovering important aspects for the Apps-Engine Runtime

The commit history will contain the steps taken and features tested. Interesting highlights will be noted below.

The HEAD of this repository will not contain a final working version for the Apps-Engine itself, but only the latest stage of testing I'm in.

# Relevant Commits

From latest to oldest. Sometimes the commit title/message is not good enough, this is an opportunity to expand on them.

* [015db6c](https://github.com/d-gubert/sec-deno-ipc/commit/015db6c4d6236f238dd677208a8f4044b96c320f) Here we see that cbor-x decodes buffers as `Uint8Arrays` when running in Deno, but decodes them as `Buffer`s when running in Node. Not a big deal, but noteworthy.
* [2d672fa](https://github.com/d-gubert/sec-deno-ipc/commit/2d672fab25da860306b457d0073484a375b051c6) Added cbor-x to serialize communication. There is an interesting not obvious behavior here.
* [c32b2d1](https://github.com/d-gubert/sec-deno-ipc/commit/c32b2d1bd4ca4f6f65f2f7faf496cc5cd1000377) First, most naive implementation

