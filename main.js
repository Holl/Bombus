// 
//   Bombus
//     _  _
//    | )/ )
// \\ |//,' __
// (")(_)-"()))=-
//    (\\
// 

// Some debug tools:
var db = require('tools.debug');

var runHerald = require('herald');

module.exports.loop = function () {
    db.vLog("~~~~~~~~~~~~~~~~"+ Game.time+"~~~~~~~~~~~~~~~~");
    
    var heraldReport = runHerald();

    var empressOrders = runEmpress(heraldReport);

    for (var queenName in heraldReport['queenObject']){
    	var queenObj = heraldReport['queenObject'][queenName];
        var empressordersForQueen = null;
        if (empressOrders[queenName]){
            empressordersForQueen = empressOrders[queenName];
        }
    	runQueen(queenName, empressordersForQueen, queenObj);
        runCarpender(queenName, heraldReport['queenObject'][queenName]);
    }

    db.vLog("~~~~~~~~Final Log~~~~~~~~");
    db.vLog("Currently " + Game.cpu.bucket + 
        " in the bucket, with " + Game.cpu.tickLimit + 
        " as the current tick limit.");
    db.vLog("Final CPU used = " + Game.cpu.getUsed());
}