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
    WebUI.prototype._send = function (data) {
        if (this.conn) {
            this.conn.send(JSON.stringify(data));
        }
    };
    /**
     * Set the main game
     */
    WebUI.prototype.setGame = function (game) {
        this.game = game;
    };
    WebUI.prototype.setActors = function (actors) {
        this._send({
            set_actors: actors
        });
    };
    WebUI.prototype.setTeams = function (teams) {
        this._send({
            set_teams: teams
        });
    };
    WebUI.prototype.setMode = function (mode) {
        this._send({
            set_mode: mode
        });
    };
    WebUI.prototype.setStep = function (step) {
        this._send({
            set_step: step
        });
    };
    WebUI.prototype.activateTeam = function (team, active) {
        this._send({
            activate_team: team
        });
    };
    WebUI.prototype.updateTeam = function (team) {
        this._send({
            update_team: team
        });
    };
    WebUI.prototype.setQuestion = function (question) {
        this._send({
            set_question: question
        });
    };
    WebUI.prototype.setAnswered = function (controllerIndex, answered) {
        this._send({
            set_answered: {
                controllerIndex: controllerIndex,
                answered: answered
            }
        });
    };
    return WebUI;
}());
exports.WebUI = WebUI;
