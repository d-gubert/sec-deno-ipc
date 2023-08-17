import { Buffer } from 'node:buffer';
import { encode, decode } from 'npm:cbor-x';

const isSubprocess = Deno.args.includes('--subprocess');

const log = (...args: any[]): void => {
	console.log('DENO >', ...args);
};

async function processConstructAppMessage(payload: any): Promise<void> {
	// eslint-disable-next-line
	// @ts-ignore - Deno makes this available, and eslint was complaining as well
	const appWorker = new Worker(new URL('./deno-worker.ts', import.meta.url).href, {
		type: 'module',
		name: `app-worker:${payload.appId as string}`,
	});

	appWorker.postMessage(encode({
		event: 'construct',
		payload,
	}));
}

async function mainSubprocess(): Promise<void> {
	const stdin = Deno.stdin;
	const stdout = Deno.stdout;
	const decoder = new TextDecoder();

	for await (const rawChunk of stdin.readable) {
		const message = decode(rawChunk);

		log({ rawChunk: decoder.decode(rawChunk), cbor: message, });

		if (message.event === 'construct app') {
			await processConstructAppMessage(message.payload);
		}
		// await stdout.write();
	}
}

async function main(): Promise<void> {
	// eslint-disable-next-line
	// @ts-ignore - Deno makes this available, and eslint was complaining as well
	const work1 = new Worker(new URL('./deno-worker.ts', import.meta.url).href, {
		type: 'module',
	});

	work1.postMessage(encode({ a: 1, b: Buffer.from('buff me daddy') }));
}

if (isSubprocess) {
	void mainSubprocess();
} else {
	void main();
}
