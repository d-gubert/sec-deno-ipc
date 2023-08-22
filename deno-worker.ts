import { Buffer } from 'node:buffer';
import { encode, decode } from 'npm:cbor-x';
// import * as App from '@rocket.chat/apps-engine/definition/App';

declare const self: Window & typeof globalThis & { onmessage: (event: MessageEvent) => Promise<void> };

// eslint-disable-next-line
const log = (...args: any[]): void => (console.log('WORKER >', ...args), undefined);

// log({ App });

const wrapAppCode = (code: string): Function => new Function('require', `
	const exports = {};
	const module = { exports };
	((exports,module,require) => {
		${code};
	})(exports,module,require);
	return module.exports;
`);

const ALLOWED_NATIVE_MODULES = ['path', 'url', 'crypto', 'buffer', 'stream', 'net', 'http', 'https', 'zlib', 'util', 'punycode', 'os', 'querystring'];
const ALLOWED_EXTERNAL_MODULES = ['uuid'];

const buildRequirer = async (preloadModules: string[]): Promise<(module: string) => any> => {
	// A simple object is desireable here over a Map, as we're going to do direct lookups
	// and not as many inserts and iterations. For more details https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#objects_vs._maps
	const loadedModules: Record<string, any> = Object.create(null);

	await Promise.all(preloadModules.map(async (module: string) => {
		// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
		if (loadedModules[module]) {
			return;
		}

		if (ALLOWED_NATIVE_MODULES.includes(module)) {
			loadedModules[module] = await import(`node:${module}`);
			return;
		}

		if (ALLOWED_EXTERNAL_MODULES.includes(module)) {
			loadedModules[module] = await import(`npm:${module}`);
			return;
		}

		if (module.startsWith('@rocket.chat/apps-engine')) {
			loadedModules[module] = await import(`${module}.ts`);
			return;
		}

		throw new Error(`Module ${module} is not allowed`);
	}));

	return (module: string): any => {
		console.log('require', module);

		return loadedModules[module];
	};
};

self.onmessage = async (event) => {
	const data = decode(event.data);

	if (data.event === 'construct') {
		const requirer = await buildRequirer(data.payload.deps);
		const result = wrapAppCode(data.payload.appSourceFileContent);

		log(result, data.payload.appSourceFileContent);
		log(result(requirer));
	}
};

// log(self);
