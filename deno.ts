import { Buffer } from 'node:buffer';
import { encode, decode } from 'npm:cbor-x';

const stdin = Deno.stdin;
const stdout = Deno.stdout;

async function main(): Promise<void> {
	for await (const rawChunk of stdin.readable) {
		console.log('DENO >', {
			rawChunk: typeof rawChunk,
			buffer: Buffer.from(rawChunk).toString(),
			cbor: decode(rawChunk),
		});
		await Deno.writeTextFile('test.txt', decode(rawChunk));
		// await stdout.write();
	}
}

void main();
