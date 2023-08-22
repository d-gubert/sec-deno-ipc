import { encode, decode } from 'cbor-x';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { EOL } from 'os';
// import { unlinkSync } from 'fs';

function getAppDependencies(appSourceFileContent) {
	const regex = /require\((['"])(.+?)\1\)/g;
	const dependencies = [];

	let match;

	while ((match = regex.exec(appSourceFileContent), match !== null)) {
		dependencies.push(match[2]);
	}

	return dependencies;
}

const deno = spawn('/home/douglas/.nvm/versions/node/v14.21.3/bin/npx', [
	'deno',
	'run',
	'--allow-read=deno-worker.ts',
	'--node-modules-dir',
	'deno.ts',
	'--subprocess',
]);

deno.stdout.on('data', function (data) {
	console.log(data.toString());
});

deno.stderr.on('data', function (data) {
	console.log('OOPS FROM DENO >', data.toString());
});

deno.stdin.write(encode({ type: 'start', path: './deno.ts' }));

process.stdin.on('data', function (data) {
	if (data.includes('exit')) {
		process.stdout.write('Byeeeeee' + EOL);
		deno.kill();
		return process.exit(0);
	}

	if (data.includes('send app')) {
		const appFileContent = readFileSync('./TestApp.js', 'utf-8');

		const message = {
			event: 'construct app',
			payload: {
				appId: 'e7ad328b-661d-48d5-aca8-35de299c2ccd',
				appSourceFileContent: appFileContent,
				deps: getAppDependencies(appFileContent),
			},
		};

		deno.stdin.write(encode(message));
		return;
	}

	deno.stdin.write(encode({ message: data }));
});

// connect the server to the deno process
