/// <reference path="node_modules/definitely-typed/express/express.d.ts" />
/// <reference path="nodejs-websocket.d.ts" />
'use strict';
var WebUI = (function () {
    function WebUI(expressApp, game, websocketPort) {
        this.app = expressApp;
        this.game = game;
        this.port = websocketPort;
        this.conn = null;
        this.initWebapp();
        this.initWebsocket();
    }
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
    WebUI.prototype.activateTeam = function (team) {
        this.conn.send(JSON.stringify({
            activate_team: team
        }));
    };
    WebUI.prototype.setQuestion = function (question) {
        this.conn.send(JSON.stringify({
            set_question: question
        }));
    };
    return WebUI;
}());
exports.WebUI = WebUI;
