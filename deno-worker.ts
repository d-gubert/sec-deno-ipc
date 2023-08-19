import { Buffer } from 'node:buffer';
import { encode, decode } from 'npm:cbor-x';

declare const self: Window & typeof globalThis & { onmessage: (event: MessageEvent) => Promise<void> };

// eslint-disable-next-line
const log = (...args: any[]): void => (console.log('WORKER >', ...args), undefined);

const wrapAppCode = (code: string): Function => new Function('require', `
	const exports = {};
	const module = { exports };
	((exports,module,require) => {
		${code};
	})(exports,module,require);
	return module.exports;
`);

const requirer = (module: string): any => {
	console.log('require', module);
	if (['path', 'url', 'crypto', 'buffer', 'stream', 'net', 'http', 'https', 'zlib', 'util', 'punycode', 'os', 'querystring'].includes(module)) {
		import * as mod from 'node:' + module;
		return mod;
	}
	return {
		App: class DummyApp {},
	}
};

self.onmessage = async (event) => {
	const data = decode(event.data);

	if (data.event === 'construct') {
		const result = wrapAppCode(data.payload.appSourceFileContent);

		log(result, data.payload.appSourceFileContent);
		log(result(requirer));
		return;
	}

	log(Buffer.from(event.data), decode(event.data));
};

// log(self);
