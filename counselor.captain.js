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
                        for (swarm in Memory.census.empireObject.liveAttacks[0].beesOnDeck){
                            if (Memory.census.empireObject.liveAttacks[0].beesOnDeck[swarm].swarmName == Game.creeps[bee].memory.swarmName){
                                Memory.census.empireObject.liveAttacks[0].beesOnDeck[swarm].swarmBees.push(Game.creeps[bee].memory.role)
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
        swarmAttack(beeName, attackInfo)
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
            if (bee.hits < (bee.hitsMax/2)){
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
            console.log(prepRoom)
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
                    bee.moveTo(target);
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