import { encode, decode } from 'cbor-x';

async function main () {
	process.stdin.on('data', function (rawData) {
		console.log('SUBPROCESS >', {
			rawChunk: typeof rawData,
			buffer: Buffer.from(rawData).toString(),
			cbor: decode(rawData),
		});
	});
}

void main();
