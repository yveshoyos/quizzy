import { Game } from './game';
import { Team } from './team';
import { Question } from './question';

export interface GameUI {
	addEventListener(event: string, callback: Function);

	removeEventListener(event: string, callback: Function);

	leave(): void;

	setActors(actors: { buzzer: boolean, game: boolean, master: boolean }): void;

	setGame(game: Game): void;

	setTeams(teams: Array<Team>): void;

	setMode(teams: string): void;

	setStep(step: number): void;

	activateTeam(team: Team, active: boolean): void;

	updateTeam(team: Team): void;

	setQuestion(question: Question): void;

	setAnswered(controllerIndex: number, answered: boolean): void;
}
