const AV = require('../utils/leancloud-storage');


class Zan extends AV.Object {

    // article  Pointer 赞的帖子
    // creater   Pointer 本条回复的发布者

    
    // set article(value) {
    //     this.set('article', value);
    // }
    // get article() {
    //     return this.get('article');
    // }
    // set creater(value) {
    //     this.set('creater', value);
    // }
    // get creater() {
    //     return this.get('creater');
    // }
}

AV.Object.register(Zan);
module.exports = Zan;
