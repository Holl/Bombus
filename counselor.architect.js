var db = require('tools.debug');

module.exports = function(queenName){
	levelUpConstruction(queenName);
}

// This is the functionality that adds contruction projects
// once we level up.
function levelUpConstruction(queenName){
    var levelUp = Memory.census.queenObject[queenName].levelUpBool;
	if (levelUp){
        var level = Memory.census.queenObject[queenName].level
        console.log("Level up!")
		var thisRoom = Game.rooms[queenName];
		var spawnPos =  thisRoom.find(FIND_MY_SPAWNS)[0].pos;
		switch (level){
			case 1:
				console.log("This shouldn't ever happen.");
				break;
			case 2:
				createDiamond(thisRoom, spawnPos.x, spawnPos.y-1);
				break;
			case 3:
				thisRoom.getPositionAt(spawnPos.x-2, spawnPos.y-2).createConstructionSite(STRUCTURE_TOWER);
				createDiamond(thisRoom, spawnPos.x, spawnPos.y+5);
				roadsToRoam(thisRoom, spawnPos);

				break;
			case 4:
				thisRoom.getPositionAt(spawnPos.x+2, spawnPos.y-2).createConstructionSite(STRUCTURE_STORAGE);
				createDiamond(thisRoom, spawnPos.x-3, spawnPos.y+2);
				createDiamond(thisRoom, spawnPos.x+3, spawnPos.y+2);
				break;
		}
	}
}

function createDiamond(room, x, y){
	room.createConstructionSite(x,y-1,STRUCTURE_EXTENSION);
	room.createConstructionSite(x,y-2,STRUCTURE_EXTENSION);
	room.createConstructionSite(x+1,y-2,STRUCTURE_EXTENSION);
	room.createConstructionSite(x-1,y-2,STRUCTURE_EXTENSION);
	room.createConstructionSite(x,y-3,STRUCTURE_EXTENSION);
	room.createConstructionSite(x,y,STRUCTURE_ROAD);
	room.createConstructionSite(x-1,y-1,STRUCTURE_ROAD);
	room.createConstructionSite(x+1,y-1,STRUCTURE_ROAD);
	room.createConstructionSite(x+2,y-2,STRUCTURE_ROAD);
	room.createConstructionSite(x-2,y-2,STRUCTURE_ROAD);
	room.createConstructionSite(x+1,y-3,STRUCTURE_ROAD);
	room.createConstructionSite(x-1,y-3,STRUCTURE_ROAD);
	room.createConstructionSite(x,y-4,STRUCTURE_ROAD);
}

function roadsToRoam(room, spawnPos){
	var spawnX = spawnPos.x;
	var spawnY = spawnPos.y;

	var startX = 0;
	var startY = 0;

	var sources = room.find(FIND_SOURCES);

	for (var source in sources){
		var sourcePos = sources[source].pos;
		if (sourcePos.y<=spawnY){
			startY = spawnY-3;
		}
		else{
			startY = spawnY+3;
		}
		if (sourcePos.x<=spawnX){
			startX = spawnX - 2;
		}
		else{
			startX = spawnX + 2;
		}
		buildRoad(room, startX, startY, sourcePos.x, sourcePos.y);
	}
	var controllerPos = room.controller.pos;
	if (controllerPos.y<=spawnY){
		startY = spawnY-3;
	}
	else{
		startY = spawnY+3;
	}
	if (controllerPos.x<=spawnX){
		startX = spawnX - 2;
	}
	else{
		startX = spawnX + 2;
	}
	buildRoad(room, startX, startY, controllerPos.x, controllerPos.y);
}

function buildRoad(room, startX, startY, endX, endY){
	var route = room.getPositionAt(startX,startY).findPathTo(endX,endY);
	route.pop();
	for (var point in route){
		room.getPositionAt(route[point].x,route[point].y).createConstructionSite(STRUCTURE_ROAD);
	}
}