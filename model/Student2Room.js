const AV = require('../utils/leancloud-storage');
const Student = require('Student');
const Room = require('Room');

class Student2Room extends AV.Object {
    // nickname

    // student Pointer
    // room Pointer


    set nickname(value) {
        this.set('nickname', value);
    }
    get nickname() {

        return this.get('nickname');
    }
    set student(value) {
        this.set('student', value);
    }
    get student() {
        //   return new Student(JSON.stringify(this.get('student'), {parse: true}))
        return this.get('student');
        // return this.get('student').toJSON();
        // return JSON.parse(this.get('student'));
        // return this.attributes.room.id;
    }
    set room(value) {
        this.set('room', value);
    }
    get room() {
        //   return new Room(JSON.stringify(this.get('room'), {parse: true}))
        return this.get('room');
        // return this.get('room').toJSON();
        // return JSON.parse(JSON.stringify(this.get('room')));
    }


}

AV.Object.register(Student2Room);
module.exports = Student2Room;
