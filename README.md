
# sec-deno-ipc

A study of IPC between Node <-> Deno, Deno Web Workers, and other potential features that aid sub process management - with a focus on discovering important aspects for the Apps-Engine Runtime

The commit history will contain the steps taken and features tested. Interesting highlights will be noted below.

The HEAD of this repository will not contain a final working version for the Apps-Engine itself, but only the latest stage of testing I'm in.

*Next step*: determine app's dependencies before hand so we can prompt the worker to load them asynchronously _before parsing the code_ - this way we can workaround the lack of sync require.

## Notes/Lessons learned

- Due to Workers not being able to correctly import Apps-Engine files, we might need to go with many processes for apps instead of an app with many workers.
- Struggled a while with importing the Apps-Engine. It turned out that I configured the import maps incorrectly, which prevented me from importing files correctly in the subprocess. However, even with a configuration that imports correctly in the subprocess, imports _inside the Worker_ do not work as expected. This might be a problem with the Worker implementation, as 
it doesn't seem to take the import maps into consideration in the same way as its "host" process.
  <details>
    <summary>Previous (wrong) conclusions</summary>
    There is a big blocker with Apps-Engine imports here. Because the package is designed to not act as a module per se (by exporting the components from its entrypoint) but rather more as a folder for the required files to interact with, Deno does not interact with it the same way Node does. For it to recognize the internal imports from the Apps-Engine it requires the use of <a href="https://deno.land/manual@v1.36.2/basics/import_maps#example---using-deno_stds-fmt-module-via-fmt">import maps</a>
    
    Another issue that appeared is how the Apps-Engine is compiled. I've tried different target modules `commonjs`, `umd`, `es6`, but there are always different problems including files from inside the worker. I've been able to interact a bit with the package via the REPL but I couldn't determine why.
    
    This _might_ be a particularity of using the Apps-Engine, I'll try it out from inside the engine to see if importing works differently.
  </details>
- Deno doesn't have a require and the only way to dynamically import modules is asynchronous.
- Even if it is possible to import a module native to node (via `node:MODULE_NAME`), that doesn't mean all functionalities are supported - the `vm` module is an example
- As `vm` is not implemented, we needed to fallback to the `eval`-like `Function` constructor
- Data sent over streams from Node arrive as Uint8Arrays - there is no native `Buffer` class.
- Deno used to expose an api to transpile code manually. I wish it still did :(
- Web workers currently do not work in compiled executables - https://deno.land/manual@v1.36.1/runtime/workers#workers

## Current questions we need to answer

1. How do we manage Deno dependencies? It seems to download deps defined in the `package.json` on runtime, even though I ran `npm i`. Maybe [import maps?](https://deno.land/manual@v1.36.1/basics/import_maps)
2. Is there a way to share memory between main process and workers? Something like [Shared Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#shared_workers)
3. How will we manage the scenario where the worker terminates involuntarily? What will we do if Rocket.Chat requests info from an app that's not responsive?
4. How will we manage the scenario where the Deno subprocess terminates involuntarily?

# Relevant Commits

From latest to oldest. Sometimes the commit title/message is not good enough, this is an opportunity to expand on them.

* [66e752f](https://github.com/d-gubert/sec-deno-ipc/commit/66e752fed14650053d7597807690cbbe0dc87b5f) Fixed the import map configuration and added demonstration that the subprocess is capable of correctly importing Apps-Engine
* [1a4b492](https://github.com/d-gubert/sec-deno-ipc/commit/1a4b49224f147bbfb2cf0ee7c29b02f497c97717) Extract the app's deps with regex and preemptively import them all. Started struggling with importing the Apps-Engine.
* [1715b97](https://github.com/d-gubert/sec-deno-ipc/commit/1715b97cf3a3e89c8240b504977bdceaf2349877) Tried to provide a working `require` function. However, all dynamic imports in Deno are asynchronous.
* [81e5d21](https://github.com/d-gubert/sec-deno-ipc/commit/81e5d217bcc9af4dbf752f4a7b56e947d89fc018) Replace VM with Function constructor for parsing app code
* [4e28fe0](https://github.com/d-gubert/sec-deno-ipc/commit/4e28fe0a40a8d4c5b95da295e08e7597d65038a4) Transfer the contents of a bundled rc app from Node to Deno (to worker) - and finding out `vm` does't work
* [015db6c](https://github.com/d-gubert/sec-deno-ipc/commit/015db6c4d6236f238dd677208a8f4044b96c320f) Here we see that cbor-x decodes buffers as `Uint8Arrays` when running in Deno, but decodes them as `Buffer`s when running in Node. Not a big deal, but noteworthy.
* [2d672fa](https://github.com/d-gubert/sec-deno-ipc/commit/2d672fab25da860306b457d0073484a375b051c6) Added cbor-x to serialize communication. There is an interesting not obvious behavior here.
* [c32b2d1](https://github.com/d-gubert/sec-deno-ipc/commit/c32b2d1bd4ca4f6f65f2f7faf496cc5cd1000377) First, most naive implementation

