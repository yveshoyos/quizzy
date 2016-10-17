/// <reference path="node_modules/definitely-typed/express/express.d.ts" />
/// <reference path="nodejs-websocket.d.ts" />
'use strict';
var WebUI = (function () {
    function WebUI(expressApp, websocketPort) {
        this.app = expressApp;
        this.port = websocketPort;
        this.conn = null;
        this.eventListeners = { 'ready': [], 'leave': [] };
        this.initWebapp();
        this.initWebsocket();
    }
    WebUI.prototype.addEventListener = function (event, callback) {
        this.eventListeners[event].push(callback);
    };
    WebUI.prototype.removeEventListener = function (event, callback) {
        var index = this.eventListeners[event].indexOf(callback);
        this.eventListeners[event].splice(index, 1);
    };
    WebUI.prototype.leave = function () {
    };
    /**
     * Set the main game
     */
    WebUI.prototype.setGame = function (game) {
        this.game = game;
    };
    WebUI.prototype.setTeams = function (teams) {
        this.conn.send(JSON.stringify({
            set_teams: teams
        }));
    };
    WebUI.prototype.setMode = function (mode) {
        this.conn.send(JSON.stringify({
            set_mode: mode
        }));
    };
    WebUI.prototype.setStep = function (step) {
        this.conn.send(JSON.stringify({
            set_step: step
        }));
    };
    WebUI.prototype.activateTeam = function (team, active) {
        this.conn.send(JSON.stringify({
            activate_team: team
        }));
    };
    WebUI.prototype.updateTeam = function (team) {
        this.conn.send(JSON.stringify({
            update_team: team
        }));
    };
    WebUI.prototype.setQuestion = function (question) {
        this.conn.send(JSON.stringify({
            set_question: question
        }));
    };
    WebUI.prototype.setAnswered = function (controllerIndex, answered) {
        this.conn.send(JSON.stringify({
            set_answered: {
                controllerIndex: controllerIndex,
                answered: answered
            }
        }));
    };
    return WebUI;
}());
exports.WebUI = WebUI;
