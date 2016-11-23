import { Game } from './game';
import { Team } from './team';
import { Question } from './question';

export interface GameUI {
	addEventListener(event: string, callback: Function): void;

	removeEventListener(event: string, callback: Function): void;

	leave(): void;

	setActors(actors: { buzzer: boolean, game: boolean, master: boolean }): void;

	setGame(game: Game): void;

	setTeams(teams: Array<Team>): void;

	setTeamActivationDuration(duration: number): void

	setMode(teams: string): void;

	setStep(step: string): void;

	activateTeam(team: Team, active: boolean): void;

	updateTeam(team: Team): void;

	setQuestion(question: Question): void;

	setAnswered(controllerIndex: number, answered: boolean): void;


	//
	setQuestions(questions: Array<Question>): void;

	startQuestion(index: number): void;

	continueQuestion(index: number): void;

	validateAnswer(points: number): void;

	finishGame(): void;
}
