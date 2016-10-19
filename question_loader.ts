/// <reference path="node_modules/definitely-typed/glob/glob.d.ts" />


import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { Question, Category } from './question';

/*export interface QuestionList {
	[name: string]: Array<Question>;
}*/

export class QuestionList {
	mode: string;
	questions: Array<Question>;
	index: number;
		
	constructor(mode: string) {
		this.mode = mode;
		this.questions = [];
		this.index = 0;
	}
	
	add(question: Question) {
		this.questions.push(question);	
	}
	
	reorder() {
		if (this.mode == 'random') {
			this.questions = shuffle(this.questions);
		} else {
			this.questions = this.questions.sort((a, b) => {
				return a.category.localeCompare(b.category);
			});
		}
	}

	get(index: number) {
		return this.questions[index];
	}
	
	next():Question {
		this.index++;
		return this.questions[this.index]; 
	}

	length():number {
		return this.questions.length;
	}

	map(callback: (value:Question) => void) {
		this.questions.forEach(callback);
	}
}

export class QuestionLoader {

	questions: QuestionList;

	constructor() {
		this.questions = null;
	}

	load(directory:string, mode:string, callback: Function) {
		this.questions = new QuestionList(mode);

		glob(directory+"/**/*", (err, files) => {
			files.forEach((file) => {
				var f = fs.lstatSync(file);
				if (f.isFile()) {
					var q = Question.fromFile(file);

					this.questions.add(q);
				}

				this.questions.reorder();
			});
			callback(this.questions);
		});
	}
}

function shuffle(array:Array<any>): Array<any> {
	let counter = array.length;

	// While there are elements in the array
	while (counter > 0) {
		// Pick a random index
		let index = Math.floor(Math.random() * counter);

		// Decrease counter by 1
		counter--;

		// And swap the last element with it
		let temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}

	return array;
}
