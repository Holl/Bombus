var common = require('tools.commonFunctions');
var db = require('tools.debug');
var beeFunc = require('tools.beeFunctions')

module.exports = function(queenName){

    var scoutArray = Memory.census.queenObject[queenName].bees.scout;

	for (var beeIndex in scoutArray){
		var ourBee = Game.creeps[scoutArray[beeIndex]];
		var currentRoomName = ourBee.room.name;

        if(ourBee.memory.mission == "remote"){
            if (ourBee.memory.targetRoom){
                if (ourBee.memory.targetRoom == currentRoomName){
                    var spawnLoc = common.findCenterSpawnLocation(currentRoomName);
                    var room = Game.rooms[currentRoomName];
                    var sources = room.find(FIND_SOURCES);
                    var controller = room.controller;
                    var deposits = room.find(FIND_DEPOSITS);
                    var owner='';
                    if(controller){
                        if (controller.owner){
                            owner = controller.owner.username;
                        }
                        else{
                            owner=false;
                        }
                    }
                    else{
                        owner=null; 
                    }
                    
                    if (spawnLoc == false){
                        Memory.empress.scoutReports[currentRoomName] = {
                            "capturable":false,
                            "sources": sources,
                            "controller": controller,
                            "owner":owner,
                            "deposits":deposits
                        }
                    }
                    else{
                        Memory.empress.scoutReports[currentRoomName] = {
                            "capturable":true,
                            "spawnLocation": spawnLoc,
                            "sources": sources,
                            "controller": controller,
                            "owner":owner,
                            "deposits":deposits
                        }
                    }
                    ourBee.memory.targetRoom = '';
                }
                else {
                    // db.str(ourBee.pos.findPathTo(RoomPosition(25,25,ourBee.memory.targetRoom)));
    
                    if (ourBee.moveTo(new RoomPosition(25,25,ourBee.memory.targetRoom), {maxRooms: 24, maxOps: 5000}) == ERR_NO_PATH){
                        Memory.empress.scoutReports[ourBee.memory.targetRoom] = {
                            "reachable": false
                        }
                    }
                }
            }
            else{
                
            }
        }
	}
}