"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const question_loader_1 = require("./question_loader");
const jsonfile = require("jsonfile");
const path = require("path");
class Game {
    constructor(buzzer, gameUI, masterUI, questionsDirectory, startOrContinue) {
        this.buzzer = buzzer;
        this.gameUI = gameUI;
        this.masterUI = masterUI;
        this.questionsDirectory = questionsDirectory;
        this.devices = { buzzer: false, game: false, master: false };
        this.started = false;
        this.screen = 'starting';
        this.oldScreen = null;
        this.mode = null;
        this.teams = [];
        this.questions = null;
        this.currentQuestionIndex = -1;
        this.answerWaitingForValidation = null;
        this.answers = [];
        this.startOrContinue = startOrContinue;
        if (startOrContinue == 'continue') {
            this.recoverFromSave();
        }
        this.buzzer.addEventListener('ready', () => {
            console.log('ready ???');
            var max = this.buzzer.controllersCount();
            for (var i = 0; i < max; i++) {
                this.buzzer.lightOff(i);
            }
            this.devices.buzzer = true;
            this.checkReady();
        });
        this.gameUI.addEventListener('ready', () => {
            this.devices.game = true;
            this.gameUI.setGame(this);
            this.checkReady();
        });
        this.masterUI.addEventListener('ready', () => {
            this.devices.master = true;
            this.masterUI.setGame(this);
            this.checkReady();
        });
        this.buzzer.addEventListener('leave', () => {
            this.devices.buzzer = false;
            this.leave();
        });
        this.gameUI.addEventListener('leave', () => {
            this.devices.game = false;
            this.leave();
        });
        this.masterUI.addEventListener('leave', () => {
            this.devices.master = false;
            this.leave();
        });
    }
    checkReady() {
        if (this.devices.game) {
            this.gameUI.sendDevices(this.devices);
        }
        if (this.devices.master) {
            this.masterUI.sendDevices(this.devices);
        }
        if (!this.devices.buzzer || !this.devices.game || !this.devices.master) {
            return;
        }
        if (!this.isStarted()) {
            this.start();
            return;
        }
        this.continue();
    }
    leave() {
        this.oldScreen = this.screen;
        this.screen = 'devices';
        if (this.devices.game) {
            this.gameUI.sendDevices(this.devices);
            this.gameUI.sendScreen(this.screen);
        }
        if (this.devices.master) {
            this.masterUI.sendDevices(this.devices);
            this.masterUI.sendScreen(this.screen);
        }
    }
    isStarted() {
        return this.started;
    }
    start() {
        this.started = true;
        this.setScreen('mode-select');
    }
    continue() {
        this.setScreen(this.oldScreen);
        if (this.mode) {
            this.setMode(this.mode, false);
        }
        if (this.teams) {
            this.sendTeams(this.teams);
        }
        if (this.questions && this.screen != 'score') {
            this.startQuestions();
        }
    }
    save() {
        var file = path.join(this.questionsDirectory, 'game.json');
        var data = {
            mode: this.mode,
            teams: this.teams,
            started: this.started,
            screen: this.screen,
            currentQuestionIndex: this.currentQuestionIndex,
            answerWaitingForValidation: this.answerWaitingForValidation,
            answers: this.answers,
            questions: this.questions && this.questions.all()
        };
        var promise = new Promise((resolve, reject) => {
            jsonfile.writeFile(file, data, () => {
                resolve();
            });
        });
        return promise;
    }
    recoverFromSave() {
        var file = path.join(this.questionsDirectory, 'game.json');
        var save = jsonfile.readFileSync(file);
        console.log('save : ', save);
        this.mode = save.mode;
        this.teams = save.teams;
        this.started = save.started;
        this.screen = save.screen;
        this.oldScreen = save.screen;
        this.currentQuestionIndex = save.currentQuestionIndex;
        this.answerWaitingForValidation = save.answerWaitingForValidation;
        this.answers = save.answers;
        this.questions = new question_loader_1.QuestionList(this.mode);
        this.questions.fromArray(save.questions);
    }
    setScreen(screen) {
        this.screen = screen;
        this.gameUI.sendScreen(this.screen);
        this.masterUI.sendScreen(this.screen);
    }
    setMode(mode, setScreenMode = true) {
        this.mode = mode;
        this.save();
        if (setScreenMode) {
            this.gameUI.sendPlayMode(mode);
            this.masterUI.sendPlayMode(mode);
        }
    }
    initTeams() {
        var letters = 'ABCDEFGHIJKLMNOPQRST'.split('');
        this.teams = new Array(this.buzzer.controllersCount())
            .join()
            .split(',')
            .map((_, index) => {
            return {
                name: letters[index],
                id: letters[index].toLowerCase(),
                lightOn: false,
                active: false,
                flash: false,
                points: 0
            };
        });
    }
    sendTeams(teams) {
        this.gameUI.sendTeams(teams);
        this.masterUI.sendTeams(teams);
    }
    updateTeamName(teamIndex, newName) {
        var team = this.teams[teamIndex];
        team.name = newName;
        this.sendTeam(team);
    }
    sendTeam(team, lightOn = true, flash = true) {
        team.lightOn = lightOn;
        team.flash = flash;
        this.gameUI.sendUpdateTeam(team);
        this.masterUI.sendUpdateTeam(team);
        team.flash = false;
    }
    setTeamsActivation() {
        this.initTeams();
        this.sendTeams(this.teams);
        this.loadQuestions(this.mode);
        this.setScreen('team-activation');
        this.buzzer.onPress((controllerIndex, buttonIndex) => {
            console.log('buzz : ', controllerIndex);
            this.activateTeam(controllerIndex);
        });
        this.save();
    }
    activateTeam(controllerIndex) {
        console.log('activateTeam', controllerIndex, this.teams.length);
        var team = this.teams[controllerIndex];
        if (team.active) {
            return;
        }
        this.buzzer.lightOn(controllerIndex);
        team.active = true;
        this.sendTeam(team);
        this.save();
    }
    startQuestions() {
        this.setScreen('questions');
        this.gameUI.sendQuestions(this.questions.all(), this.currentQuestionIndex);
        this.masterUI.sendQuestions(this.questions.all(), this.currentQuestionIndex);
        this.teams.map((team, index) => {
            team.lightOn = false;
            this.buzzer.lightOff(index);
            this.gameUI.sendUpdateTeam(team);
            this.masterUI.sendUpdateTeam(team);
        });
        this.buzzer.onPress((controllerIndex, buttonIndex) => {
            this.buzzed(controllerIndex);
        });
        this.save();
    }
    loadQuestions(mode) {
        var ql = new question_loader_1.QuestionLoader();
        this.questions = null;
        ql.load(this.questionsDirectory, mode, (questions) => {
            this.questions = questions;
            this.questions.map((question) => {
                question.loadInformations(() => { });
            });
        });
    }
    buzzed(controllerIndex) {
        console.log('Press on ' + controllerIndex);
        if (this.currentQuestionIndex == -1 || this.answerWaitingForValidation != null) {
            return;
        }
        var answer = this.answers[this.currentQuestionIndex];
        if (answer[controllerIndex] != -1) {
            return;
        }
        var team = this.teams[controllerIndex];
        this.buzzer.lightOn(controllerIndex);
        this.sendTeam(team);
        this.answerWaitingForValidation = controllerIndex;
        this.gameUI.sendAnswered(controllerIndex, true);
        this.masterUI.sendAnswered(controllerIndex, true);
    }
    resetTeams() {
        this.teams.map((team) => {
            this.sendTeam(team, false, false);
        });
    }
    resetBuzzers() {
        this.teams.map((team, index) => {
            this.buzzer.lightOff(index);
        });
    }
    startQuestion(index) {
        this.answerWaitingForValidation = null;
        this.currentQuestionIndex = index;
        this.resetTeams();
        this.resetBuzzers();
        this.answers[this.currentQuestionIndex] = new Array(this.buzzer.controllersCount())
            .join()
            .split(',')
            .map(() => {
            return -1;
        });
        this.gameUI.sendPlayQuestion(index, "play");
        this.masterUI.sendPlayQuestion(index, "play");
        this.save();
    }
    continueQuestion() {
        this.answerWaitingForValidation = null;
        this.resetTeams();
        this.resetBuzzers();
        this.gameUI.sendPlayQuestion(this.currentQuestionIndex, "continue");
        this.masterUI.sendPlayQuestion(this.currentQuestionIndex, "continue");
        this.save();
    }
    setPoints(points) {
        var controllerIndex = this.answerWaitingForValidation;
        var team = this.teams[controllerIndex];
        team.points += points;
        this.answers[this.currentQuestionIndex][controllerIndex] = 1;
        this.buzzer.lightOff(controllerIndex);
        this.sendTeam(team, false, false);
        this.save();
    }
    finishGame() {
        this.setScreen('score');
        this.save();
    }
}
exports.Game = Game;
//# sourceMappingURL=game.js.map