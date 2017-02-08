const AV = require('../utils/leancloud-storage');


class Room extends AV.Object {

    // name
    // picurl
    // desc
    // creater   Pointer
    // province
    // city
    // dist
    // entry_year
    // teacher
    // question
    // answer

    
    // set name(value) {
    //     this.set('name', value);
    // }
    // get name() {
    //     return this.get('name');
    // }

    // set picurl(value) {
    //     this.set('picurl', value);
    // }
    // get picurl() {
    //     return this.get('picurl');
    // }

    // set desc(value) {
    //     this.set('desc', value);
    // }
    // get desc() {
    //     return this.get('desc');
    // }

    // set creater(value) {
    //     this.set('creater', value);
    // }
    // get creater() {
    //     return this.get('creater');
    // }

    // set province(value) {
    //     this.set('province', value);
    // }
    // get province() {
    //     return this.get('province');
    // }
    // set city(value) {
    //     this.set('city', value);
    // }
    // get city() {
    //     return this.get('city');
    // }
    // set entry_year(value) {
    //     this.set('entry_year', value);
    // }
    // get entry_year() {
    //     return this.get('entry_year');
    // }
    // set dist(value) {
    //     this.set('dist', value);
    // }
    // get dist() {
    //     return this.get('dist');
    // }
    // set teacher(value) {
    //     this.set('teacher', value);
    // }
    // get teacher() {
    //     return this.get('teacher');
    // }
    // set question(value) {
    //     this.set('question', value);
    // }
    // get question() {
    //     return this.get('question');
    // }
    // set answer(value) {
    //     this.set('answer', value);
    // }
    // get answer() {
    //     return this.get('answer');
    // }



}

AV.Object.register(Room);
module.exports = Room;
