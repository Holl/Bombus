const verbose = 1;

module.exports = {
	str(obj){
	    console.log(JSON.stringify(obj));
	},
	vLog(string){
		if (verbose){
			console.log(string);
		}
	}
}