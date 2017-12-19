"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require("glob");
const fs = require("fs");
const path = require("path");
const question_1 = require("./question");
class QuestionList {
    constructor(mode) {
        this.mode = mode;
        this.questions = [];
        this.index = 0;
    }
    add(question) {
        this.questions.push(question);
    }
    reorder() {
        if (this.mode == 'random') {
            this.questions = shuffle(this.questions);
        }
        else {
            this.questions = this.questions.sort((a, b) => {
                return a.category.localeCompare(b.category);
            });
        }
    }
    get(index) {
        return this.questions[index];
    }
    next() {
        this.index++;
        return this.questions[this.index];
    }
    length() {
        return this.questions.length;
    }
    all() {
        return this.questions;
    }
    fromArray(questions) {
        questions.map((question) => {
            this.add(question);
        });
    }
    map(callback) {
        this.questions.forEach(callback);
    }
}
exports.QuestionList = QuestionList;
class QuestionLoader {
    constructor() {
        this.questions = null;
    }
    load(directory, mode, callback) {
        this.questions = new QuestionList(mode);
        glob(directory + "/**/*", (err, files) => {
            files.forEach((file) => {
                var f = fs.lstatSync(file);
                if (f.isFile() && path.basename(file) != 'game.json') {
                    var q = question_1.Question.fromFile(file);
                    this.questions.add(q);
                }
                this.questions.reorder();
            });
            callback(this.questions);
        });
    }
}
exports.QuestionLoader = QuestionLoader;
function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}
//# sourceMappingURL=question_loader.js.map