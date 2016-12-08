const AV = require('../utils/leancloud-storage');


class Room extends AV.Object {
  
// roomname
// picurl
// desc
// creater   Pointer
// province
// city
// dist
// entryyear
// teacher

}

AV.Object.register(Room);
module.exports = Room;
