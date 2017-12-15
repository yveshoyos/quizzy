import { Game, Devices, Screen, Mode, PlayState } from './game'
import { Question } from './question'
import { Team } from './team'


export interface GameUI {
	// Attaches a listener to an event
	addEventListener(event: string, callback: Function)

	// Removes the event listener
	removeEventListener(event: string, callback: Function)

	// Triggers the event
	triggerEvent(event: string, value: any)

	// Sets the game reference
	setGame(game: Game)

	// Sets the devices availabilities
	sendDevices(devices: Devices)

	// Sets the teams
	sendTeams(teams: Array<Team>)

	// Update a team
	sendUpdateTeam(team: Team)

	// Sets the current screen
	sendScreen(screen: Screen)

	// Sets the playMode
	sendPlayMode(mode: Mode)

	// Sets the questions
	sendQuestions(questions: Array<Question>, startQuestionIndex?: number)

	// Plays or continue a question
	sendPlayQuestion(questionIndex: number, state: PlayState)

	// Sent that someone buzz to answer or not
	sendAnswered(questionIndex: number, answered: boolean)

	// Accepts or refuse an answer
	sendAnswer(questionIndex: number, correct: boolean)

}