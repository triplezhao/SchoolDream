const AV = require('../utils/leancloud-storage');


class Zan extends AV.Object {
  
// article  Pointer 赞的帖子
// fromuser   Pointer 本条回复的发布者

}

AV.Object.register(Zan);
module.exports = Zan;
