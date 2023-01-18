var db = require('tools.debug');

module.exports = {
	destroyNonOwnedBuildings(roomName){
		// Loop through all buildings, if not owned by me, destroy
		roomStruct = Game.rooms[roomName].find(FIND_STRUCTURES);

		for (build in roomStruct){
			if (roomStruct[build].owner != "KEVIN"){
				roomStruct[build].destroy();
			}
		}
	},
	reutrnIDsFromArray(array){
		var idArray = [];
		for (var thing in array){
			idArray.push(array[thing].id)
		}
		return idArray;
	},
	getMemoryByQueenName(queenName){
		return Memory['census']['queenObject'][queenName];
	}, 
	doesObjectHaveKeysOfArray(array, obj){
		return array.every(item => obj.hasOwnProperty(item));
	},
	upgradeController(bee){
	    if(bee.upgradeController(bee.room.controller) == ERR_NOT_IN_RANGE) {
	        bee.moveTo(bee.room.controller);
	    }
		else{
			// bee.moveTo(bee.room.controller);
			bee.signController(bee.room.controller, "Bombus AI");
		}
	},
	findContainerIDFromSource(sourceID){
	    var source = Game.getObjectById(sourceID)
		if (source){
			var sourcePos = source.pos;
			var container = sourcePos.findInRange(FIND_STRUCTURES,1,
				{filter: {structureType: STRUCTURE_CONTAINER}});
			if (Object.keys(container).length == 0){
				container = sourcePos.findInRange(FIND_CONSTRUCTION_SITES,1);
			}
			if (Object.keys(container).length == 0){
				return false;
			}
			else{
				return container[0].id;
			}
		}
		else{
			return false;
		}
	},
	findCenterSpawnLocation(roomName){

		// This is the logic to find our central spawn 
		// location that will build our diamond base.

		// Start by grabbing all the data we'll need...

		var room = Game.rooms[roomName];
		var terrain = room.getTerrain();
		var sources = room.find(FIND_SOURCES);
		var controller = room.controller;
		var possiblePos = [];

		if (!controller){
			return false;
		}
		if (sources.length == 0){
			return false;
		}


		// The first bit of math is easy, we're just looking for the
		// average X/Y coords of the sources and the controller,
		// as this will be useful in determining where our base SHOULD be.
		// We'll compare this to where it CAN be later.

		var totalX = 0;
		var totalY = 0;

		for (var x = 0; x < sources.length; x++){
			totalX+=sources[x].pos.x;
			totalY+=sources[x].pos.y;
		}

		totalX+=controller.pos.x;
		totalY+=controller.pos.y;

		var avgX = totalX/(sources.length + 1);
		var avgY = totalY/(sources.length + 1);

		// Now we begin our crazy expensive process of looking at every
		// point.

		// We start at 8 and go to 41 because we know the edges
		// won't work.  The base would go over the edges!

		// This functionality can be HEAVILY improved in effectiveness
		// by starting from the pythagorasCheck'd point and working out,
		// rather than every position on the map.  Still it's not terribly
		// expensive, given how infrequently this needs to run, so...
		// meh.

		for (var y=8; y<41; y++){ 

			// Count is useful to know if we have a clear row of 11 to build.
			var count = 0;

			for (var x=8; x<41; x++){
				var point = terrain.get(x,y);
				if (point == 0 || point == 2){
					// Clear or swamp.
					count++;
				}
				else{
					// Wall, so we reset!
					count=0;
				}
				if (count>10){
					// We've hit a good row, and can check if the surrounding area
					// is OK.
					var baseCheckBool = checkWallsAroundSpawn(x,y,terrain);
					if (baseCheckBool == true){
						// If this returns true, we know it's a suitable location.
						// We'll push it to the possible array.
						db.vLog("Base can start at (" + x +"," + y + ")");
						possiblePos.push({"x":x,"y":y});
					}
				}
			}
		}

		db.vLog("The average X is " + avgX);
		db.vLog("The average Y is " +avgY);

		var finalPos = pythagorasCheck(avgX,avgY,possiblePos);

		return finalPos;
	},
	scoutSnapshot(roomName){
		var room = Game.rooms[roomName];
		var sources = room.find(FIND_SOURCES);
		var sourceArray = [];
		for (var source in sources){
			sourceArray.push(sources[source].id)
		}
		var controller = room.controller;
		var deposits = room.find(FIND_DEPOSITS);
		var owner='';
		if(controller){
			if (controller.owner){
				owner = controller.owner.username;
			}
			else if (controller.reservation){
				owner = controller.reservation;
			}
			else{
				owner=false;
			}
		}
		else{
			owner=null; 
		}
	
		return {
			"sources": sources,
			"controller": controller,
			"owner":owner,
			"deposits":deposits
		}
	},
	attackSnapshot(beeName){
		var bee = Game.creeps[beeName];
		var room = bee.room;
		var controller = room.controller;
		var roomLevel = 0;
		if (controller.level){
			roomLevel = controller.level;
		}

		var spawns = bee.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType == STRUCTURE_SPAWN)
			}
		});
		var towers = bee.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType == STRUCTURE_TOWER)
			}
		});
		var extensions = bee.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType == STRUCTURE_EXTENSION)
			}
		});
		var storage = bee.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType == STRUCTURE_STORAGE)
			}
		});

		var spawnPathable = null;
		var towerPathable = null;
		var extensionPathable = null;
		var storagePathable = null;
		var storageAmount = null;
		var distanceToTower = null;

		if (spawns.length > 0){
			spawnPathable = canWePathToTarget(bee.pos, spawns[0].pos);
		}
		if (towers.length > 0){
			towerPathable = canWePathToTarget(bee.pos, towers[0].pos);
		}
		if (extensions.length > 0){
			extensionPathable = canWePathToTarget(bee.pos, extensions[0].pos);
		}
		if (storage.length > 0){
			storagePathable = canWePathToTarget(bee.pos, storage[0].pos);
			storageAmount = storage[0]['store']['energy'];
		}

		return {
			"room"				 : room.name,
			"spawnPathable"      : spawnPathable,
			"towerPathable"      : towerPathable,
			"extensionPathable"  : extensionPathable,
			"storagePathable"    : storagePathable,
			"storageAmount"      : storageAmount
		}
	}
}

function pythagorasCheck(avgX,avgY,positionArray){
	// Middle school math saves the day again.
	// We essentially need to calculate the closest possible point to 
	// the average X/Y of sources and controller determined in the main loop.
	var minDistance = 99999999;
	var closestPoint;
	var distance = 0;
	for (var a = 0; a < positionArray.length; a++) {
		distance = Math.sqrt((avgX - positionArray[a].x) * (avgX - positionArray[a].x) + (avgY - positionArray[a].y) * (avgY - positionArray[a].y));
		if (distance < minDistance) {
			minDistance = distance;
			closestPoint = positionArray[a];
		}
	}

	return closestPoint;
}

function checkWallsAroundSpawn(x,y,terrain){

	// This check has the wierdest logic, but it requires it so far as we can tell.

	// This is the array of how many X points across each level of the base shape
	// take up.  This mean, at the moment, this check could only work for
	// a symetrical base shape.
	// It's a diamond, so we start small, then go big, then back small.
	var shapeArray = [1,3,5,7,9,11,9,7,5,3,1];

	// Loop goes to 11 because that's the height.

	for (var checkY=0; checkY<11; checkY++){
		// The # in the shape array is the amount across but we need to go
		// left over to that, as the center point isn't where we start.
		// IE in the 2nd row, it may be 3 across, but it's 1 on a side,
		// so we should start our X one to the left.  The -1 just removes
		// the centerpoint.

		var leftMostX = 0-((shapeArray[checkY]-1)/2);

		// This loop is weird for sure but it makes sense.
		// Our outer loop goes the height of the shape,
		// but this inner loop only needs to run the width of the shape
		// determined by the point in the array, starting at the leftMostX.
		// That's why the loops inequality is so weird.

		for (var checkX=leftMostX; checkX<shapeArray[checkY]+leftMostX; checkX++){
			var newX = x + checkX;
			var newY = y + (checkY - 5);
			if (terrain.get(newX, newY) == 1){
				// As soon as we find a problem, we can leave.
				db.vLog(x + "," + y + " doesn't work because of " + newX + "," +newY + ".  We started this row's count at " + leftMostX + " and we counted " + shapeArray[checkY] + " times.");
				return false;
			}
		}
	}
	// If we've never run into a problem, we're OK!
	return true;
}

function canWePathToTarget(beePos, targetPos){
	// Can we get to a target?
	var pathToTarget = beePos.findPathTo(targetPos, {ignoreCreeps: true});
	if (pathToTarget[pathToTarget.length - 1]['x'] == targetPos['x'] && pathToTarget[pathToTarget.length - 1]['y'] == targetPos['y']){
		return true;
	}
	else{
		return false;
	}
}

