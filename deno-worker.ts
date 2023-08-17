import vm from 'node:vm';
import { Buffer } from 'node:buffer';
import { encode, decode } from 'npm:cbor-x';

declare const self: Window & typeof globalThis & { onmessage: (event: MessageEvent) => Promise<void> };

// eslint-disable-next-line
const log = (...args: any[]): void => (console.log('WORKER >', ...args), undefined);

self.onmessage = async (event) => {
	const payload = decode(event.data);

	if (payload.event === 'construct') {
		log('constructing app', payload);

		const result = await vm.runInNewContext(payload.appSourceFileContent);

		log({ result });
	}

	log(Buffer.from(event.data), decode(event.data));
};

log(self);
