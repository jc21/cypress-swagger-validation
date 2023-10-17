import * as pc from "picocolors"
import * as _ from 'lodash';

export default class Logger {

	private title: string;

	constructor(section: string) {
		this.title = section;
	}

	public success(...args: any[]) {
		const arr: any[] = _.values(args);
		arr.unshift(this.getTitle('SUCCESS', pc.green));
		// @ts-ignore
		console.log.apply(null, arr);
	}

	public error(...args: any[]) {
		const arr: any[] = _.values(args);
		arr.unshift(this.getTitle('ERROR', pc.red));
		// @ts-ignore
		console.log.apply(null, arr);
	}

	public info(...args: any[]) {
		const arr: any[] = _.values(args);
		arr.unshift(this.getTitle('INFO', pc.blue));
		// @ts-ignore
		console.log.apply(null, arr);
	}

	public debug(...args: any[]) {
		const arr: any[] = _.values(args);
		arr.unshift(this.getTitle('DEBUG', pc.magenta));
		// @ts-ignore
		console.log.apply(null, arr);
	}

	private getTitle(type: string, colorFn: any): string {
		return pc.blue('[') + pc.cyan(this.title) + ' ' + colorFn(pc.bold(type)) + pc.blue(']');
	}
}
