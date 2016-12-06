const AV = require('../utils/leancloud-storage');


class Notice extends AV.Object {
  
// title
// content
// pics[]
// creater  Pointer
// room Pointer
// 无评论

}

AV.Object.register(Notice);
module.exports = Notice;
