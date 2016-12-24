import * as path from 'path';
import * as mime from 'mime';

// Mp3
import * as mm from 'musicmetadata';
import * as fs from 'fs';
import * as mp3Duration from 'mp3-duration';

export type QuestionType = BlindQuestion | DeafQuestion;

export class Category {
	name: string;
	questionsCount: number;
	constructor(name:string) {
		this.name = name;
		this.questionsCount = 0;
	}
}

export abstract class Question {
	file: string;
	name: string;
	author: string;
	year: string;
	type: string;
	category: string;
	
	constructor() {
	}

	static fromFile(file:string): Question {
		var extension = path.extname(file);
		var filename = path.basename(file, extension);
		var dir = path.basename(path.dirname(file));

		//var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(?:\s*\((\d+)\))?$/i
		//var infos:Array<any> = filename.match(regex);
		
		//var infos:Array<string> = filename.split('--');
		var m = mime.lookup(file).split('/');

		var q;
		if (m[0] == 'audio') {
			q = new BlindQuestion();
		} else {
			q = new DeafQuestion();
		}

		q.file = file;
		q.category = dir;

		return q;
	}

	abstract loadInformations(callback: Function): void;
}

export class DeafQuestion extends Question {
	constructor() {
		super();
		this.type = 'deaf';
	}

	loadInformations(callback: Function) {
		var extension = path.extname(this.file);
		var filename = path.basename(this.file, extension);

		var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(?:\s*\((\d+)\))?$/i
		var infos:Array<any> = filename.match(regex);
		
		this.name = infos[3].trim();
		this.author = infos[2].trim();
		this.year = (infos[4]) ? infos[4].trim() : '';
	}
}

export class BlindQuestion extends Question {
	duration: number;
	constructor() {
		super();
		this.type = 'blind';
	}

	loadInformations(callback: Function) {
		var extension = path.extname(this.file);
		var filename = path.basename(this.file, extension);

		var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(?:\s*\((\d+)\))?$/i
		var infos:Array<any> = filename.match(regex);
		
		this.name = infos[3].trim();
		this.author = infos[2].trim();
		this.year = (infos[4]) ? infos[4].trim() : '';

		var parser = mm(fs.createReadStream(this.file), (err, metadata) => {
			if (err) {
				throw err;
			}
			mp3Duration(this.file, (err, duration) => {
				if (err) {
					throw err;
				}

				this.duration = metadata.duration;
				callback();
			});
		});	
	} 
}
