#!/usr/bin/env node
/*
const path = require('path');
*/
const fs = require('fs');
const program = require('caporal');
const chalk = require('chalk');
const { version } = require('../package.json');

const OculusVRAPI = require('./oculus_vrapi.js');

program
	.version(version);

// ANALYZE
program
	.command('record', 'Record the Oculus vrAPI stats')
	.option('--output [output]', 'Output JSON file', program.STRING)
	.action(({}, {output}, logger) => {

		let values = [];

		// Wait to start
		console.log(`Press any key to ${chalk.yellow('start')} the recording`);
		process.stdin.setRawMode(true);
		process.stdin.resume();
		process.stdin.on('data', () => {
			let x = 0;
			OculusVRAPI.init(line => {
				console.log(line);
				values.push(line);
				process.stdout.write(`${JSON.stringify(line)} \r`);
				x++;
			});


			// Wait to finish
			console.log('Press any key to stop the recording');
			process.stdin.setRawMode(true);
			process.stdin.resume();
			process.stdin.on('data', () => {
				let stats = OculusVRAPI.stop();
				console.log('\nSTATS\n', stats);
				if (output) {
					console.log(`Writing files:`);
          fs.writeFileSync(output+'_summary.json', JSON.stringify(stats, null, '\t'), err => {
            if (err) throw err;
					});
					console.log(`- ${chalk.yellow(output + '_summary.json')}`);
          fs.writeFileSync(output+'_values.json', '[\n' + values.map(v => '\t' + JSON.stringify(v)).join(',\n') + '\n]', err => {
            if (err) throw err;
          });
					console.log(`- ${chalk.yellow(output + '_values.json')}`);
				}
				process.exit();
			});
		});
	});

program
	.parse(process.argv);