import { Game, Team, Question } from './game';

export interface GameUI {
	setGame(game: Game);

	setTeams(teams: Array<Team>);

	setMode(teams: string);

	setStep(step: number);

	activateTeam(team: Team);

	setQuestion(question: Question);
}