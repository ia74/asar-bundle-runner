module.exports = {
	name: 'RobotJS asar Test',
	exec: () => {
		const robotjs = require('robotjs');
		console.log('Moving mouse to a random spot.')
		robotjs.moveMouse(Math.random().toString().substring(2, 4), Math.random().toString().substring(2, 4));
	},
	onButtonPressed: (button) => {
		console.log(button)
	}
}