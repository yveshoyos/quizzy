/// <reference path="node_modules/definitely-typed/glob/glob.d.ts" />
"use strict";
var glob = require('glob');
var fs = require('fs');
var question_1 = require('./question');
/*export interface QuestionList {
    [name: string]: Array<Question>;
}*/
var QuestionList = (function () {
    function QuestionList(mode) {
        this.mode = mode;
        this.questions = [];
        this.index = 0;
    }
    QuestionList.prototype.add = function (question) {
        this.questions.push(question);
    };
    QuestionList.prototype.reorder = function () {
        if (this.mode == 'random') {
            this.questions = shuffle(this.questions);
        }
        else {
            this.questions = this.questions.sort(function (a, b) {
                return a.category.localeCompare(b.category);
            });
        }
    };
    QuestionList.prototype.next = function () {
        this.index++;
        return this.questions[this.index];
    };
    QuestionList.prototype.map = function (callback) {
        this.questions.forEach(callback);
    };
    return QuestionList;
}());
exports.QuestionList = QuestionList;
var QuestionLoader = (function () {
    function QuestionLoader() {
        this.questions = null;
    }
    QuestionLoader.prototype.load = function (directory, mode, callback) {
        var _this = this;
        this.questions = new QuestionList(mode);
        glob(directory + "/**/*", function (err, files) {
            files.forEach(function (file) {
                var f = fs.lstatSync(file);
                if (f.isFile()) {
                    var q = question_1.Question.fromFile(file);
                    _this.questions.add(q);
                }
                _this.questions.reorder();
            });
            callback(_this.questions);
        });
    };
    return QuestionLoader;
}());
exports.QuestionLoader = QuestionLoader;
function shuffle(array) {
    var counter = array.length;
    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        var index = Math.floor(Math.random() * counter);
        // Decrease counter by 1
        counter--;
        // And swap the last element with it
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}
