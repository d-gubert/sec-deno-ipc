import { spawn } from 'child_process';
// import { unlinkSync } from 'fs';

const deno = spawn('node_modules/deno-bin/bin/deno', [
	'run',
	'--allow-net',
	'deno.ts',
]);

deno.stdout.on('data', function (data) {
	console.log(data.toString());
});

deno.stderr.on('data', function (data) {
	console.log('OOPS FROM DENO >', data.toString());
});

deno.stdin.write('{"type":"start","path":"./deno.ts"}');

process.stdin.on('data', function (data) {
	if (data.toString() === 'exit\n') {
		deno.kill();
		return process.exit(0);
	}

	deno.stdin.write(data);
});

// connect the server to the deno process
