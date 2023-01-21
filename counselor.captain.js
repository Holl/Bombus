var db = require('tools.debug');

module.exports = function(){
    var liveAttacks = Memory.census.empireObject.liveAttacks;
    var liveBees = [];
    for (var bee in Game.creeps){
        if (Game.creeps[bee].memory.swarmName){
            for (attack in liveAttacks){
                var targetRoom = Game.creeps[bee].memory.targetRoom;
                if (liveAttacks[attack].room == targetRoom){
                    swarmBeeFunction(bee, liveAttacks[attack]);
                    if (Game.creeps[bee].ticksToLive == 50){
                        for (swarm in Memory.census.empireObject.liveAttacks[attack].beesOnDeck){
                            if (Memory.census.empireObject.liveAttacks[attack].beesOnDeck[swarm].swarmName == Game.creeps[bee].memory.swarmName){
                                Memory.census.empireObject.liveAttacks[attack].beesOnDeck[swarm].swarmBees.push(Game.creeps[bee].memory.role)
                            }
                        }
                    }
                }
            }
        }
    }
}

function swarmBeeFunction(beeName, attackInfo){
    var attackType = attackInfo.type;
    if (attackType == "drain"){
        swarmAttack(beeName, attackInfo);
    }
    else if (attackType == "rush"){
        rushAttack(beeName, attackInfo);
    }
}

function swarmAttack(beeName, attackInfo){
    var targetRoom = attackInfo.room;
    var bee = Game.creeps[beeName];
    var role = bee.memory.role;
    var currentRoomName = bee.room.name;
    var prepRoom = attackInfo.prepRoom;
    var prepRoomRally = attackInfo.prepRoomRally;
    if (role == "tank"){
        if (targetRoom == currentRoomName){
            if (bee.hits < (bee.hitsMax*.6)){
                bee.moveTo(new RoomPosition(prepRoomRally.x,prepRoomRally.y,prepRoom), {visualizePathStyle:{}});
            }
            else{
                if (bee.pos.x == 0){
                    bee.move(RIGHT);
                }
                else if (bee.pos.y == 0){
                    bee.move(UP)
                }
                else if (bee.pos.y == 49){
                    bee.move(DOWN)
                }
                else if (bee.pos.x == 49){
                    bee.move(LEFT)
                }
            }
        }
        else if (prepRoom == currentRoomName){
            if (bee.hits<bee.hitsMax){
                bee.moveTo(new RoomPosition(prepRoomRally.x,prepRoomRally.y,prepRoom), {visualizePathStyle:{}});
            }
            else{
                bee.moveTo(new RoomPosition(25,25,targetRoom), {visualizePathStyle:{stroke:'red'}});
            }
        }
        else{
            bee.moveTo(new RoomPosition(prepRoomRally.x,prepRoomRally.y,prepRoom), {visualizePathStyle:{}});
        }
    }
    if (role == "healer"){
        if (prepRoom == currentRoomName){
            var target = bee.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: function(object) {
                    return object.hits < object.hitsMax;
                }
            });
            if (target){
                if(bee.heal(target) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(new RoomPosition(prepRoomRally.x,prepRoomRally.y,prepRoom), {visualizePathStyle:{}});
                }
            }
            else{
                bee.moveTo(new RoomPosition(prepRoomRally.x,prepRoomRally.y,prepRoom), {visualizePathStyle:{}});
            }
        }
        else{
            bee.moveTo(new RoomPosition(prepRoomRally.x,prepRoomRally.y,prepRoom), {visualizePathStyle:{}});
        }
    }
}

function rushAttack(beeName, attackInfo){
    var targetRoom = attackInfo.room;
    var bee = Game.creeps[beeName];
    var role = bee.memory.role;
    var currentRoomName = bee.room.name;
    if (role == "rusher"){

        if (targetRoom == currentRoomName){
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
            var extensions = bee.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION)
                }
            });
            var storage = bee.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE)
                }
            });
            var everythingElse = bee.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES,
                {
                    filter: { structureType: STRUCTURE_EXTENSION }
                }
            );


            if (spawns[0]){
                console.log(spawns[0])
                if(bee.attack(spawns[0]) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(spawns[0]);
                }
            }
            else if (towers[0]){
                console.log(towers[0])
                if(bee.attack(towers[0]) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(towers[0]);
                }
            }
            else if (extensions){
                if(bee.attack(extensions) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(extensions);
                }  
            }
            else if (storage){
                if(bee.attack(storage) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(storage);
                }  
            }
            else if (everythingElse){
                if(bee.attack(everythingElse) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(everythingElse);
                }   
            }
        }
        else{
            bee.moveTo(new RoomPosition(25,25,targetRoom), {visualizePathStyle:{stroke:'red'}});
        }
    }
}