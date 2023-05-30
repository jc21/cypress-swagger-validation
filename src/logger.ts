import * as chalk from 'chalk';
import * as _ from 'lodash';

export default class Logger {

	private title: string;

	constructor(section: string) {
		this.title = section;
	}

	public success(...args: any[]) {
		const arr: any[] = _.values(args);
		arr.unshift(this.getTitle(chalk.green.bold('SUCCESS')));
		// @ts-ignore
		console.log.apply(null, arr);
	}

	public error(...args: any[]) {
		const arr: any[] = _.values(args);
		arr.unshift(this.getTitle(chalk.red.bold('ERROR')));
		// @ts-ignore
		console.log.apply(null, arr);
	}

	public info(...args: any[]) {
		const arr: any[] = _.values(args);
		arr.unshift(this.getTitle(chalk.blue.bold('INFO')));
		// @ts-ignore
		console.log.apply(null, arr);
	}

	public debug(...args: any[]) {
		const arr: any[] = _.values(args);
		arr.unshift(this.getTitle(chalk.magenta.bold('DEBUG')));
		// @ts-ignore
		console.log.apply(null, arr);
	}

	private getTitle(type: string): string {
		return chalk.blue.bold('[') + chalk.cyan.bold(this.title) + ' ' + type + chalk.blue.bold(']');
	}
}
