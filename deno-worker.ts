import { Buffer } from 'node:buffer';
import { encode, decode } from 'npm:cbor-x';

declare const self: Window & typeof globalThis & { onmessage: (event: MessageEvent) => Promise<void> };

// eslint-disable-next-line
const log = (...args: any[]): void => (console.log('WORKER >', ...args), undefined);

const wrapAppCode = (code: string): Function => new Function(`
	const exports = {};
	const module = { exports };
	const require = (...args) => {
		console.log('require', ...args);
		return {
			App: class DummyApp {},
		}
	};
	((exports,module,require) => {
		${code};
	})(exports,module,require);
	return module.exports;
`);

self.onmessage = async (event) => {
	const data = decode(event.data);

	if (data.event === 'construct') {
		const result = wrapAppCode(data.payload.appSourceFileContent);

		log(result, data.payload.appSourceFileContent);
		log(result(data.payload.appSourceFileContent));
		return;
	}

	log(Buffer.from(event.data), decode(event.data));
};

// log(self);
