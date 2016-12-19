const AV = require('../utils/leancloud-storage');


class Article extends AV.Object {

    // title
    // content
    // pics
    // creater  Pointer
    // room Pointer
    // comments [] array方式 云函数处理  评论的问题，文章列表，返回的时候，希望将评论列表页一起返回，不要二次查询。( 用pointer array方式存comment，可以只存储最新两个，或者n条评论，)
    // zannum    云函数处理
    // commentnum  云函数处理

    //云端处理不了 array，在评论的时候，是评论保存之后，这时候的文章只是个指针，无法获取到当前文章的obj。就没法增加数组。
   
    set title(value) {
        this.set('title', value);
    }
    get title() {
        return this.get('title');
    }
    set content(value) {
        this.set('content', value);
    }
    get content() {
        return this.get('content');
    }

    set pics(value) {
        this.set('pics', value);
    }
    get pics() {
        return this.get('pics');
    }

    set creater(value) {
        this.set('creater', value);
    }
    get creater() {
        return this.get('creater');
    }

    set room(value) {
        this.set('room', value);
    }
    get room() {
        return this.get('room');
    }


    set comments(value) {
        this.set('comments', value);
    }
    get comments() {
        return this.get('comments');
    }
    set zannum(value) {
        this.set('zannum', value);
    }
    get zannum() {
        return this.get('zannum');
    }
    set commentnum(value) {
        this.set('commentnum', value);
    }
    get commentnum() {
        return this.get('commentnum');
    }

}

AV.Object.register(Article);
module.exports = Article;
