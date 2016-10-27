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
    function Game(buzzer, gameUI, masterUI) {
        var _this = this;
        this.buzzer = buzzer;
        this.gameUI = gameUI;
        this.masterUI = masterUI;
        this.actors = { buzzer: false, game: false, master: false };
        this.teamActivationDuration = 60;
        this.started = false;
        this.questions = null;
        this.answers = [];
        this.questionIndex = -1;
        this.answerWaitingForValidation = null;
        /**
         * Ready
         */
        var buzzerReady = false, gameReady = false, masterReady = false;
        this.buzzer.addEventListener('ready', function () {
            console.log('buzzer ready...');
            var max = _this.buzzer.controllersCount();
            // Make sur all buzzer are off
            for (var i = 0; i < max; i++) {
                _this.buzzer.lightOff(i);
            }
            _this.actors.buzzer = true;
            _this.ready();
        });
        this.gameUI.addEventListener('ready', function () {
            sounds.play('actors');
            _this.actors.game = true;
            _this.gameUI.setGame(_this);
            _this.ready();
        });
        this.masterUI.addEventListener('ready', function () {
            _this.actors.master = true;
            _this.masterUI.setGame(_this);
            _this.ready();
        });
        /**
         * Leave
         */
        this.buzzer.addEventListener('leave', function () {
            _this.actors.buzzer = false;
            _this.leave();
        });
        this.gameUI.addEventListener('leave', function () {
            _this.actors.game = false;
            _this.leave();
        });
        this.masterUI.addEventListener('leave', function () {
            _this.actors.master = false;
            _this.leave();
        });
    }
    Game.prototype.ready = function () {
        this.gameUI.setActors(this.actors);
        this.masterUI.setActors(this.actors);
        if (this.actors.buzzer && this.actors.game && this.actors.master) {
            if (!this.isStarted()) {
                this.start();
            }
            else {
                //this.restart();
                this.gameUI.setStep(this.step);
                this.masterUI.setStep(this.step);
                if (this.mode) {
                    this.gameUI.setMode(this.mode);
                    this.masterUI.setMode(this.mode);
                }
                this.teams.forEach(function (team) {
                    team.active = false;
                });
                this.gameUI.setTeams(this.teams);
                this.masterUI.setTeams(this.teams);
                if (this.questionIndex >= 0) {
                    this.setQuestion(this.questions.get(this.questionIndex));
                }
            }
        }
    };
    Game.prototype.leave = function () {
        this.gameUI.setActors(this.actors);
        this.masterUI.setActors(this.actors);
    };
    Game.prototype.start = function () {
        this.step = 0;
        this.started = true;
        this.activatedTeams = 0;
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
    };
    //
    // Mode step
    //
    Game.prototype.setMode = function (mode) {
        this.mode = mode;
        this.loadQuestions(mode);
        this.gameUI.setMode(this.mode);
    };
    Game.prototype.modeStep = function () {
        this.step = 1;
        this.gameUI.setStep(1);
        this.masterUI.setStep(1);
    };
    Game.prototype.activationStep = function () {
        var _this = this;
        sounds.stop('actors');
        this.step = 2;
        this.gameUI.setTeamActivationDuration(this.teamActivationDuration);
        this.masterUI.setTeamActivationDuration(this.teamActivationDuration);
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
        }, this.teamActivationDuration * 1000);
    };
    Game.prototype.quizzStep = function () {
        var _this = this;
        if (this.activatedTeams <= 0) {
            this.modeStep();
            return;
        }
        // Stop the team activation
        this.stopTeamActivation();
        if (this.stopTeamActivationTimeout) {
            clearTimeout(this.stopTeamActivationTimeout);
        }
        // Turn off teams
        this.teams.forEach(function (team, index) {
            team.active = false;
            _this.buzzer.lightOff(index);
            _this.gameUI.updateTeam(team);
            _this.masterUI.updateTeam(team);
        });
        this.gameUI.setQuestions(this.questions.all());
        this.masterUI.setQuestions(this.questions.all());
        // Go to step 3 : showing questions
        this.step = 3;
        this.gameUI.setStep(3);
        this.masterUI.setStep(3);
        this.buzzer.onPress(function (controllerIndex, buttonIndex) {
            console.log('onPress : ', controllerIndex, buttonIndex, _this.questionIndex, _this.answerWaitingForValidation);
            if (_this.questionIndex == -1 || _this.answerWaitingForValidation != null) {
                return;
            }
            var qAnswers = _this.answers[_this.questionIndex];
            console.log('anwser : ', qAnswers[controllerIndex]);
            if (qAnswers[controllerIndex] == -1) {
                sounds.play('answer');
                _this.buzzed(controllerIndex);
            }
            else {
                console.log('already answered :(');
            }
        });
    };
    Game.prototype.startQuestion = function (questionIndex) {
        this.questionIndex = questionIndex;
        this.answers[this.questionIndex] = new Array(this.buzzer.controllersCount())
            .join()
            .split(',')
            .map(function () {
            return -1;
        });
        this.answerWaitingForValidation = null;
        this.masterUI.startQuestion(questionIndex);
        this.gameUI.startQuestion(questionIndex);
    };
    Game.prototype.continueQuestion = function (questionIndex) {
        //this.questionIndex = questionIndex;
        this.answerWaitingForValidation = null;
        this.masterUI.continueQuestion(questionIndex);
        this.gameUI.continueQuestion(questionIndex);
    };
    //
    // Question step
    //
    Game.prototype.validateAnswer = function (answer) {
        console.log('addPoints');
        var controllerIndex = this.answerWaitingForValidation;
        var team = this.teams[controllerIndex];
        team.points += answer.points;
        team.active = false;
        team.flash = true;
        this.answers[this.questionIndex][controllerIndex] = (answer.success) ? 1 : 0;
        // Light the buzzer on
        this.buzzer.lightOff(controllerIndex);
        this.gameUI.updateTeam(team);
        this.masterUI.updateTeam(team);
        team.flash = false;
        answer.teamIndex = controllerIndex;
        this.gameUI.validateAnswer(answer);
        this.masterUI.validateAnswer(answer);
    };
    //
    // Steps
    //
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
    Game.prototype.buzzed = function (controllerIndex) {
        var team = this.teams[controllerIndex];
        // Flash the team that has buzzed
        team.flash = true;
        team.active = true;
        this.gameUI.updateTeam(team);
        this.masterUI.updateTeam(team);
        team.flash = false;
        // Light the buzzer on
        this.buzzer.lightOn(controllerIndex);
        // Just pause the game
        this.answerWaitingForValidation = controllerIndex;
        this.gameUI.setAnswered(controllerIndex, true);
        this.masterUI.setAnswered(controllerIndex, true);
    };
    Game.prototype.setQuestion = function (question) {
        this.answerWaitingForValidation = null;
        this.gameUI.setQuestion(question);
        this.masterUI.setQuestion(question);
    };
    Game.prototype.nextQuestion = function () {
        console.log('nextQuestion');
        this.questionIndex++;
        if (this.questionIndex == this.questions.length()) {
            console.log('ennnnnnnd');
            this.end();
        }
        this.answers[this.questionIndex] = new Array(this.buzzer.controllersCount())
            .join()
            .split(',')
            .map(function () {
            return -1;
        });
        // Send the next question to uis
        var question = this.questions.next();
        this.setQuestion(question);
    };
    Game.prototype.end = function () {
        console.log('Finiiiiiiiiii');
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
