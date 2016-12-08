const AV = require('../utils/leancloud-storage');


class Article extends AV.Object {
  
// title
// content
// pics
// creater  Pointer
// room Pointer
// comments [] array方式  评论的问题，文章列表，返回的时候，希望将评论列表页一起返回，不要二次查询。( 用pointer array方式存comment，可以只存储最新两个，或者n条评论，)
// zannum    云函数处理
// commentnum  云函数处理
}

AV.Object.register(Article);
module.exports = Article;
