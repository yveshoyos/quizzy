/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="node_modules/definitely-typed/musicmetadata/musicmetadata.d.ts" />
/// <reference path="mp3-duration.d.ts" />
"use strict";
var sounds = require('./sounds');
var mm = require('musicmetadata');
var fs = require('fs');
var mp3Duration = require('mp3-duration');
var question_loader_1 = require('./question_loader');
var Game = (function () {
    function Game(buzzer) {
        var _this = this;
        this.buzzer = buzzer;
        this.gameUI = null;
        this.masterUI = null;
        this.started = false;
        this.questions = null;
        this.answers = [];
        this.questionIndex = -1;
        this.answerWaitingForValidation = null;
        this.buzzer.ready(function () {
            var max = _this.buzzer.controllersCount();
            // Make sur all buzzer are off
            for (var i = 0; i < max; i++) {
                _this.buzzer.lightOff(i);
            }
        });
    }
    Game.prototype.start = function () {
        this.started = true;
        this.activatedTeams = 0;
        this.step = 0;
        this.initTeam();
        this.modeStep();
    };
    Game.prototype.initTeam = function () {
        var letters = 'ABCDEFGHIJKLMNOPQRST'.split('');
        this.teams = new Array(this.buzzer.controllersCount())
            .join()
            .split(',')
            .map(function (v, index) {
            return {
                name: letters[index],
                id: letters[index].toLowerCase(),
                active: false,
                flash: false,
                points: 0
            };
        });
    };
    Game.prototype.isStarted = function () {
        return this.started;
    };
    Game.prototype.stop = function () {
        if (!this.isStarted()) {
            return;
        }
        // Do something
    };
    Game.prototype.register = function (type, instance) {
        if (type == 'game') {
            this.gameUI = instance;
        }
        else if (type == 'master') {
            this.masterUI = instance;
        }
        if (!this.isStarted() && this.masterUI && this.gameUI) {
            this.start();
        }
        else if (this.isStarted()) {
            console.log('set currentStep');
            instance.setTeams(this.teams);
            instance.setStep(this.step);
        }
    };
    Game.prototype.unregister = function (type) {
        if (type == 'game') {
            this.gameUI = null;
        }
        else if (type == 'master') {
            this.masterUI = null;
        }
    };
    Game.prototype.setMode = function (mode) {
        this.mode = mode;
        console.log('set mode...');
        this.loadQuestions(mode);
        this.gameUI.setMode(this.mode);
        //this.activationStep();
    };
    Game.prototype.addPoints = function (points) {
        console.log('addPoints');
        var controllerIndex = this.answerWaitingForValidation;
        var team = this.teams[controllerIndex];
        team.points += points;
        team.active = false;
        team.flash = true;
        this.gameUI.updateTeam(team);
        this.masterUI.updateTeam(team);
        team.flash = false;
        this.nextQuestion();
    };
    //
    // Steps
    //
    Game.prototype.modeStep = function () {
        this.step = 1;
        this.gameUI.setStep(1);
        this.masterUI.setStep(1);
    };
    Game.prototype.activationStep = function () {
        var _this = this;
        this.step = 2;
        // Send the teams to uis
        this.gameUI.setTeams(this.teams);
        this.masterUI.setTeams(this.teams);
        // Go to step 2
        this.gameUI.setStep(2);
        this.masterUI.setStep(2);
        this.stopTeamActivation = this.buzzer.onPress(function (controllerIndex, buttonIndex) {
            _this.activateTeam(controllerIndex);
        });
        // Go to next step after a timeout
        this.stopTeamActivationTimeout = setTimeout(function () {
            _this.quizzStep();
        }, 9000);
    };
    Game.prototype.activateTeam = function (controllerIndex) {
        var team = this.teams[controllerIndex];
        console.log('activateTeam : ', controllerIndex, team);
        // make sure a team can only be activated once
        if (team.active) {
            return;
        }
        sounds.play('activate_team');
        // Count the activated teams
        this.activatedTeams++;
        // Light the buzzer on
        this.buzzer.lightOn(controllerIndex);
        // Activate the team
        team.active = true;
        team.flash = true;
        this.gameUI.activateTeam(team, true);
        this.masterUI.activateTeam(team, true);
        team.flash = false; // Just flash during activation
        // If all teams are activated, go to next step
        if (this.activatedTeams == this.buzzer.controllersCount()) {
            this.quizzStep();
        }
    };
    Game.prototype.quizzStep = function () {
        var _this = this;
        if (this.activatedTeams <= 0) {
            this.step = 0;
            this.gameUI.setStep(0);
            this.masterUI.setStep(0);
            return;
        }
        // Stop the team activation
        this.stopTeamActivation();
        if (this.stopTeamActivationTimeout) {
            clearTimeout(this.stopTeamActivationTimeout);
        }
        // Turn off teams
        this.teams.forEach(function (team) {
            team.active = false;
            _this.gameUI.updateTeam(team);
            _this.masterUI.updateTeam(team);
        });
        // Go to step 3 : showing questions
        this.step = 3;
        this.gameUI.setStep(3);
        this.masterUI.setStep(3);
        // Load the first question
        this.questionIndex = -1;
        this.nextQuestion();
        this.buzzer.onPress(function (controllerIndex, buttonIndex) {
            if (_this.questionIndex == -1 || _this.answerWaitingForValidation != null) {
                return;
            }
            var qAnswers = _this.answers[_this.questionIndex];
            if (qAnswers[controllerIndex] == -1) {
                _this.buzzed(controllerIndex);
            }
            else {
                console.log('already answered :(');
            }
        });
    };
    Game.prototype.buzzed = function (controllerIndex) {
        var team = this.teams[controllerIndex];
        // Flash the team that has buzzed
        team.flash = true;
        team.active = true;
        this.gameUI.updateTeam(team);
        this.masterUI.updateTeam(team);
        team.flash = false;
        // Just pause the game
        this.answerWaitingForValidation = controllerIndex;
        this.gameUI.setAnswered(controllerIndex, true);
        this.masterUI.setAnswered(controllerIndex, true);
    };
    Game.prototype.nextQuestion = function () {
        console.log('nextQuestion');
        this.questionIndex++;
        this.answers[this.questionIndex] = new Array(this.buzzer.controllersCount())
            .join()
            .split(',')
            .map(function () {
            return -1;
        });
        // Send the next question to uis
        var question = this.questions.next();
        this.answerWaitingForValidation = null;
        this.gameUI.setQuestion(question);
        this.masterUI.setQuestion(question);
    };
    Game.prototype.loadQuestions = function (mode) {
        var _this = this;
        var directory = './questions';
        var ql = new question_loader_1.QuestionLoader();
        this.questions = null;
        ql.load(directory, mode, function (questions) {
            _this.questions = questions;
            _this.questions.map(function (question) {
                if (question.type == 'blind') {
                    loadMp3Informations(question, function () { });
                }
            });
        });
    };
    return Game;
}());
exports.Game = Game;
function loadMp3Informations(question, callback) {
    var parser = mm(fs.createReadStream(question.file), function (err, metadata) {
        if (err) {
            console.log('errrrrr');
            throw err;
        }
        mp3Duration(question.file, function (err, duration) {
            if (err) {
                console.log('errrrrr');
                throw err;
            }
            question.duration = metadata.duration;
            callback();
        });
    });
}
