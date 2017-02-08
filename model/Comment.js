const AV = require('../utils/leancloud-storage');


class Comment extends AV.Object {

    // content

    // toarticle  Pointer 回复的帖子   评论的问题，文章列表，返回的时候，希望将评论列表页一起返回，不要二次查询。( 用pointer array方式存comment，可以只存储最新两个，或者n条评论，)

    // tocomment Pointer 回复的目标评论
    // touser Pointer 回复的目标人

    // creater   Pointer 本条回复的发布者

  
    // set content(value) {
    //     this.set('content', value);
    // }
    // get content() {
    //     return this.get('content');
    // }

    // set toarticle(value) {
    //     this.set('toarticle', value);
    // }
    // get toarticle() {
    //     return this.get('toarticle');
    // }

    // set tocomment(value) {
    //     this.set('tocomment', value);
    // }
    // get tocomment() {
    //     return this.get('tocomment');
    // }

    // set touser(value) {
    //     this.set('touser', value);
    // }
    // get touser() {
    //     return this.get('touser');
    // }


    // set creater(value) {
    //     this.set('creater', value);
    // }
    // get creater() {
    //     return this.get('creater');
    // }




}

AV.Object.register(Comment);
module.exports = Comment;
