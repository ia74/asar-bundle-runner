const ABRBundle = require("./classes/ABRBundle");
const normalExtraction = new ABRBundle("src/normalExtraction.asar");
// normalExtraction.run()
normalExtraction.extract().then(() => {
	normalExtraction.run();
});