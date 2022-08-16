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
                    ourBee.moveTo(25,25,ourBee.memory.targetRoom);
                    var data = common.scoutSnapshot(currentRoomName);
                    if(!Memory.census.queenObject[queenName].remoteRooms[currentRoomName]){
                        Memory.census.queenObject[queenName].remoteRooms[currentRoomName] = data;
                    }
                    ourBee.memory.targetRoom = null;
                }
                else {
                    if (ourBee.moveTo(new RoomPosition(25,25,ourBee.memory.targetRoom), {maxRooms: 24, maxOps: 5000}) == ERR_NO_PATH){
                        db.vLog("This doesn't work.")
                    }
                }
            }
            else{
                var exits = Game.map.describeExits(currentRoomName);
                var remoteRooms = Memory.census.queenObject[queenName].remoteRooms;
                var queenCheck = false;
                var completedCheck = true;
                for (exit in exits){
                    if ((!remoteRooms[exits[exit]] || !remoteRooms[exits[exit]].armComplete) && exits[exit] != queenName){
                        ourBee.memory.targetRoom = exits[exit];
                        completedCheck = false;
                    }
                    if (exits[exit] == queenName || ourBee.room.name == queenName){
                        queenCheck = true;
                    }
                }
                if (queenCheck == false){
                    ourBee.suicide();
                }
                if (completedCheck){
                    Memory.census.queenObject[queenName].remoteRooms[currentRoomName].armComplete = true;
                    ourBee.suicide();
                }
                if (ourBee.moveTo(25,25,ourBee.memory.targetRoom, {}) == ERR_NO_PATH){
                    Memory.empress.scoutReports[ourBee.memory.targetRoom] = {
                        "reachable": false
                    }
                };
            }
        }
        else if (ourBee.memory.mission == "expand"){
            if (ourBee.memory.targetRoom){
                if (ourBee.memory.targetRoom == currentRoomName){
                    ourBee.moveTo(25,25,ourBee.memory.targetRoom);
                    var data = common.scoutSnapshot(currentRoomName);
                    if(!Memory.census.empireObject.territoryObject[currentRoomName]){
                        Memory.census.empireObject.territoryObject[currentRoomName] = data;
                    }
                    Memory.census.empireObject.potentialTerritoryArray.shift();
                    ourBee.memory.targetRoom = null;
                }
                else {
                    if (ourBee.moveTo(new RoomPosition(25,25,ourBee.memory.targetRoom), {maxRooms: 24, maxOps: 5000}) == ERR_NO_PATH){
                        db.vLog("This doesn't work.")
                    }
                };
            }
            else{
                if (Memory.census.empireObject.potentialTerritoryArray){
                    ourBee.memory.targetRoom = Memory.census.empireObject.potentialTerritoryArray[0];
                }
            }
        }
	}
}