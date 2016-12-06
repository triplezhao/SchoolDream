const AV = require('../utils/leancloud-storage');


class Comment extends AV.Object {
  
// content
// article  Pointer 回复的帖子   评论的问题，文章列表，返回的时候，希望将评论列表页一起返回，不要二次查询。( 用pointer array方式存comment，可以只存储最新两个，或者n条评论，)
// touser Pointer 回复的目标人
// tocomment Pointer 回复的目标评论
// fromuser   Pointer 本条回复的发布者

}

AV.Object.register(Comment);
module.exports = Comment;
