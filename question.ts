import * as path from 'path';
import * as mime from 'mime';

export type QuestionType = BlindQuestion | DeafQuestion;

export class Category {
	name: string;
	questionsCount: number;
	constructor(name:string) {
		this.name = name;
		this.questionsCount = 0;
	}
}

export class Question {
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

		var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(?:\s*\((\d+)\))?$/i
		var infos:Array<any> = filename.match(regex);
		
		//var infos:Array<string> = filename.split('--');
		var m = mime.lookup(file).split('/');

		var q;
		if (m[0] == 'audio') {
			q = new BlindQuestion();
		} else {
			q = new DeafQuestion();
		}

		q.file = file;
		q.name = infos[3].trim();
		q.author = infos[2].trim();
		q.year = (infos[4]) ? infos[4].trim() : '',
		q.category = dir;

		return q;
	}
}

export class DeafQuestion extends Question {
	constructor() {
		super();
		this.type = 'deaf';
	}
}

export class BlindQuestion extends Question {
	duration: number;
	constructor() {
		super();
		this.type = 'blind';
	}
}
