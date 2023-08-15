import { encode, decode } from 'cbor-x';
import { spawn } from 'child_process';
import { EOL } from 'os';
// import { unlinkSync } from 'fs';

const deno = spawn('/home/douglas/.nvm/versions/node/v14.21.3/bin/npx', [
	'deno',
	'run',
	'--allow-net',
	'--allow-write',
	'--node-modules-dir',
	'deno.ts',
]);

deno.stdout.on('data', function (data) {
	console.log(data.toString());
});

deno.stderr.on('data', function (data) {
	console.log('OOPS FROM DENO >', data.toString());
});

deno.stdin.write(encode({"type":"start","path":"./deno.ts"}));

process.stdin.on('data', function (data) {
	if (data.toString() === 'exit\n') {
		process.stdout.write('Byeeeeee' + EOL);
		deno.kill();
		return process.exit(0);
	}

	deno.stdin.write(encode({ message: data }));
});

// connect the server to the deno process
