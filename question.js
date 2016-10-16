"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="node_modules/definitely-typed/mime/mime.d.ts" />
var path = require('path');
var mime = require('mime');
var Category = (function () {
    function Category(name) {
        this.name = name;
        this.questionsCount = 0;
    }
    return Category;
}());
exports.Category = Category;
var Question = (function () {
    function Question() {
    }
    Question.fromFile = function (file) {
        var extension = path.extname(file);
        var filename = path.basename(file, extension);
        var dir = path.basename(path.dirname(file));
        var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(\s*\((\d+)\))?$/i;
        var infos = filename.match(regex);
        //var infos:Array<string> = filename.split('--');
        var m = mime.lookup(file).split('/');
        var q;
        if (m[0] == 'audio') {
            q = new BlindQuestion();
        }
        else {
            q = new DeafQuestion();
        }
        q.file = file;
        q.name = infos[2].trim();
        q.author = infos[1].trim();
        q.year = (infos[3]) ? infos[3].trim() : '',
            q.category = dir;
        return q;
    };
    return Question;
}());
exports.Question = Question;
var DeafQuestion = (function (_super) {
    __extends(DeafQuestion, _super);
    function DeafQuestion() {
        _super.call(this);
        this.type = 'deaf';
    }
    return DeafQuestion;
}(Question));
exports.DeafQuestion = DeafQuestion;
var BlindQuestion = (function (_super) {
    __extends(BlindQuestion, _super);
    function BlindQuestion() {
        _super.call(this);
        this.type = 'blind';
    }
    return BlindQuestion;
}(Question));
exports.BlindQuestion = BlindQuestion;
