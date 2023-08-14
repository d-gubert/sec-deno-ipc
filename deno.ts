import { Buffer } from 'node:buffer';
const stdin = Deno.stdin;

async function main (): Promise<void> {
	for await (let chunk of stdin.readable) {
		chunk = Buffer.from(chunk);
		console.log('DENO >', chunk, chunk.toString());
	}
}

void main();
