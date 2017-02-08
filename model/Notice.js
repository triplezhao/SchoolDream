const AV = require('../utils/leancloud-storage');


class Notice extends AV.Object {

    // title
    // content
    // pics[]
    // creater  Pointer
    // room Pointer
    // 无评论
   
    // set title(value) {
    //     this.set('title', value);
    // }
    // get title() {
    //     return this.get('title');
    // }

    // set content(value) {
    //     this.set('content', value);
    // }
    // get content() {
    //     return this.get('content');
    // }

    // set pics(value) {
    //     this.set('pics', value);
    // }
    // get pics() {
    //     return this.get('pics');
    // }

    // set room(value) {
    //     this.set('room', value);
    // }
    // get room() {
    //     return this.get('room');
    // }


    // set creater(value) {
    //     this.set('creater', value);
    // }
    // get creater() {
    //     return this.get('creater');
    // }


}

AV.Object.register(Notice);
module.exports = Notice;
