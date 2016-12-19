const AV = require('../utils/leancloud-storage');


class Student extends AV.Object {
    //  phone
    // "openId": "OPENID",
    // "nickName": "NICKNAME",
    // "gender": GENDER,
    // "city": "CITY",
    // "province": "PROVINCE",
    // "country": "COUNTRY",
    // "avatarUrl": "AVATARURL",
    // "unionId": "UNIONID",

    // set id(value) {
    //     this.set('id', value);
    // }
    // get id() {
    //     // return this.get('id');
    //     return super.id;
    // }
    set phone(value) {
        this.set('phone', value);
    }
    get phone() {
        return this.get('phone');
    }

    //除了phone，其他都是微信的user属性
    set openid(value) {
        this.set('openid', value);
    }
    get openid() {
        return this.get('openid');
    }

    set nickname(value) {
        this.set('nickname', value);
    }
    get nickname() {
        return this.get('nickname');
    }

    set gender(value) {
        this.set('gender', value);
    }
    get gender() {
        return this.get('gender');
    }
    set city(value) {
        this.set('gender', value);
    }
    get city() {
        return this.get('gender');
    }
    set province(value) {
        this.set('province', value);
    }
    get province() {
        return this.get('province');
    }

    set country(value) {
        this.set('country', value);
    }
    get country() {
        return this.get('country');
    }
    set avatarurl(value) {
        this.set('avatarurl', value);
    }
    get avatarurl() {
        return this.get('avatarurl');
    }
    set unionid(value) {
        this.set('unionid', value);
    }
    get unionid() {
        return this.get('unionid');
    }

}

AV.Object.register(Student);
module.exports = Student;

