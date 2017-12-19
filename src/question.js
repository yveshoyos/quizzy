'use strict';

import * as path from 'path';
import * as mime from 'mime';

// Mp3
import * as mm from 'musicmetadata';
import * as fs from 'fs';
import * as mp3Duration from 'mp3-duration';

export class Category {
	//name: string;
	//questionsCount: number;
	constructor(name) {
		this.name = name;
		this.questionsCount = 0;
	}
}

export class Question {
	//file: string;
	//name: string;
	//author: string;
	//year: string;
	//type: string;
	//category: string;
	
	constructor() {
	}

	static fromFile(file)/*: Question*/ {
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

	loadInformations(callback) {
		throw new Error("you have to implement loadInformations method")
	}
}

export class DeafQuestion extends Question {
	constructor() {
		super();
		this.type = 'deaf';
	}

	loadInformations(callback) {
		var extension = path.extname(this.file);
		var filename = path.basename(this.file, extension);

		var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(?:\s*\((\d+)\))?$/i
		var infos= filename.match(regex);
		
		this.name = infos[3].trim();
		this.author = infos[2].trim();
		this.year = (infos[4]) ? infos[4].trim() : '';
	}
}

export class BlindQuestion extends Question {
	//duration: number
	//album: string
	constructor() {
		super();
		this.type = 'blind';
	}

	loadInformations(callback) {
		var extension = path.extname(this.file);
		var filename = path.basename(this.file, extension);

				//   (N°). (author) -- (music) -- (album)? (year)?
		var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(?:\s*--\s*(.*?))?(?:\s*\((\d+)\))?$/i
		var infos = filename.match(regex);

		console.log(filename, infos)
		
		this.author = infos[2].trim();
		this.name = infos[3].trim();
		this.album = (infos[4]) ? infos[4].trim() : '';
		this.year = (infos[5]) ? infos[5].trim() : '';

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
