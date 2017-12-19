"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const mime = require("mime");
const mm = require("musicmetadata");
const fs = require("fs");
const mp3Duration = require("mp3-duration");
class Category {
    constructor(name) {
        this.name = name;
        this.questionsCount = 0;
    }
}
exports.Category = Category;
class Question {
    constructor() {
    }
    static fromFile(file) {
        var extension = path.extname(file);
        var filename = path.basename(file, extension);
        var dir = path.basename(path.dirname(file));
        var m = mime.lookup(file).split('/');
        var q;
        if (m[0] == 'audio') {
            q = new BlindQuestion();
        }
        else {
            q = new DeafQuestion();
        }
        q.file = file;
        q.category = dir;
        return q;
    }
}
exports.Question = Question;
class DeafQuestion extends Question {
    constructor() {
        super();
        this.type = 'deaf';
    }
    loadInformations(callback) {
        var extension = path.extname(this.file);
        var filename = path.basename(this.file, extension);
        var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(?:\s*\((\d+)\))?$/i;
        var infos = filename.match(regex);
        this.name = infos[3].trim();
        this.author = infos[2].trim();
        this.year = (infos[4]) ? infos[4].trim() : '';
    }
}
exports.DeafQuestion = DeafQuestion;
class BlindQuestion extends Question {
    constructor() {
        super();
        this.type = 'blind';
    }
    loadInformations(callback) {
        var extension = path.extname(this.file);
        var filename = path.basename(this.file, extension);
        var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(?:\s*--\s*(.*?))?(?:\s*\((\d+)\))?$/i;
        var infos = filename.match(regex);
        console.log(filename, infos);
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
exports.BlindQuestion = BlindQuestion;
//# sourceMappingURL=question.js.map