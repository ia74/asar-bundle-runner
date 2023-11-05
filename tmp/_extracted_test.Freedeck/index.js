module.exports = {
	name: 'RobotJS asar Test',
	exec: () => {
		const robotjs = require('robotjs');
		console.log('Moving mouse to 100, 100')
		setInterval(() => {
			robotjs.moveMouse(Math.random().toString().substring(2, 4), Math.random().toString().substring(2, 4));
		},250)
	},
	onButtonPressed: (button) => {
		console.log(button)
	}
}