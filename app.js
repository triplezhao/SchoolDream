const AV = require('./utils/leancloud-storage');
const CONFIG = require('config');
const Student = require('./model/Student');
const utils = require('./utils/util');
const weixinappId = 'wx34116c4aee4ca248';
AV.init({
  // appId: 'bystxyLIuetNkwb2uGz9WYd1-gzGzoHsz',
  // appKey: 'Yf3MMSSOWHSGI87ewfRNqd7E',
  appId: CONFIG.appId,
  appKey: CONFIG.appKey,
});


const KEY_LOGINED_STUDENT = 'KEY_LOGINED_STUDENT';

App({

  globalData: {
    jioned_room_map: {},
    logined_student: null,
    room_now: null,
    refesh_change_home: false,
    refesh_change_blackboard: false,
    is_from_share: false,

  },
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // this.studentLogin();
  },


  //登出，清除内存和本地数据
  logout: function (cb) {
    var that = this;
    //清除内存
    this.globalData.logined_student = null;
    //清除本地数据
    that.clearStudentFromLocal();
  },


  //获取获取本地的student
  getStudentInfoFromLocal: function () {
    var that = this;
    var data = wx.getStorageSync(KEY_LOGINED_STUDENT);
    that.globalData.logined_student = data;
    return data;
  },

  //存储student到本地
  saveStudent2Local: function (data) {
    var that = this;
    wx.setStorageSync(KEY_LOGINED_STUDENT, data);
  },

  //清除本地登录的用户
  clearStudentFromLocal: function (cb) {
    var that = this;
    wx.removeStorageSync(KEY_LOGINED_STUDENT);
  },


  //检查本地是否有已经登录的，如果没有，则进行登录（无论注册还是登录，都需要先走getUnionId的流程），
  //如果是已经注册的用户，则将微信的头像、昵称等信息更新到服务器student.save， 如果没注册本用户，则存储student.save，并且加入默认班级(两个区别只有这个)
  //
  //如果本地存在，则不需要登录和注册操作。（考虑什么时候进行更新）
  //目前没调用
  checkLoginStatus: function (cb) {
    var that = this;
    //内存有，直接做ui逻辑
    if (this.globalData.logined_student) {
      cb(1, this.globalData.logined_student)
    } else if (that.getStudentInfoFromLocal()) {
      //本地有，直接返回
      var student = that.getStudentInfoFromLocal();
      this.globalData.logined_student = student;
      cb(1, student);

    } else {
      that.studentLogin(cb);
    }
  },


  //目前每次登录，都去刷新本地的用户数据
  //1.调用微信的登录 2.调用leancloud云函数获取微信敏感数据。 3.调用av获取业务用户数据 4.保存到本地
  studentLogin: function (cb) {
    var that = this;
    try {

      that.weixinlogin((code, data) => {
        console.log('收到回调', code + ',' + data);
        if (code == 0) {
          cb(0, "登录失败");
          return;
        }

        //存储student到local
        var student = new Student();
        //查询下是否已经注册了
        var query = new AV.Query('Student');
        query.equalTo('openid', data.openId);

        query.first()
          .then((results) => {
            if (results == undefined) {
              //没有注册，则添加新用户，
              student.set('phone', '0');
              console.log('未注册的用户: ');
            } else {
              console.log('已经注册的用户: ', results);
              //已经注册了的话，则更新
              student = results;
            }
            student.set('openid', data.openId);
            student.set('nickname', data.nickName);
            student.set('gender', data.gender);
            student.set('city', data.city);
            student.set('province', data.province);
            student.set('country', data.country);
            student.set('avatarurl', data.avatarUrl);
            student.set('unionid', data.unionId);
            console.log('拼接后的student data: ', student.get('openid'));
            //存储student到leancloud
            return student.save();

          })
          .then((saved) => {
            //更新内存
            saved = JSON.parse(JSON.stringify(saved));
            that.globalData.logined_student = saved;
            //无论是更新还是注册，都把返回的对象保存到本地
            that.saveStudent2Local(saved);
            console.log('注册或者更新完成，保存到本地: ', saved);
            cb(1, that.globalData.logined_student);
          }).catch((error) => {
            cb(0, "登录失败");
          });
      });

    } catch (error) {
      cb(0, "登录失败");
    }

  },


  //从微信登录开始进行登录。 第一步获取wx.login，第二步获取openid，第三步获取unionid。
  weixinlogin: function (cb) {
    var that = this;
    //调用登录接口
    wx.login({
      success: (wxlogin_res) => {

        if (wxlogin_res.code) {

          //发起网络请求获取用户信息
          console.log("wx.login:" + wxlogin_res.code);
          wx.getUserInfo({
            success: function (wxgetUserInfo_res) {
              console.log('wxgetUserInfo_res', wxgetUserInfo_res);
              that.getOpenId2UnionId(wxlogin_res.code, weixinappId, wxgetUserInfo_res.encryptedData, wxgetUserInfo_res.iv, cb);
            },
            fail: function () {
              // fail
              cb(0, "微信登录失败")
            },
            complete: function () {
              // complete
            }
          })
        } else {
          cb(0, "微信登录失败")
        }
      }
    });
  },

  //调用云函数，获取加密信息
  getOpenId2UnionId: function (jscode, appId, encryptedData, iv, cb) {
    var paramsJson = {
      jscode: jscode
    };
    //获取openid,利用leancloud的云函数.https://leancloud.cn/docs/leanengine_cloudfunction_guide-node.html#Hook_函数
    AV.Cloud
      .run('acl', paramsJson)
      .then((data) => {
        // 调用成功，得到成功的应答 data
        console.log('acl' + data);
        var decodeparamsJson = {
          appId: appId,
          encryptedData: encryptedData,
          sessionKey: data.session_key,
          iv: iv
        };
        //获取unionid
        return AV.Cloud.run('decode', decodeparamsJson);

      }).then((data) => {
        //成功
        console.log('服务器解密后 data: ', JSON.parse(data));
        cb(1, JSON.parse(data));
      }).catch((error) => {
        // 处理调用失败
        console.log("decode失败," + error);
        throw error;
        // cb('授权登录失败');
      });
  },

  sendtplsms_new_article: function (success, fail) {

    var that = this;

    var nickname = that.globalData.room_now.nickname;
    if (!nickname) {
      nickName=that.globalData.room_now.student.nickName;
    }
    var paramsJson = {
      pushkey: that.globalData.room_now.room.objectId,
      studentid: that.globalData.logined_student.objectId,
      pushtype: 'newarticle',
      template_id: "oAa6Ylf-8pdIHnj5uKKWj6fR63ZUL1eY1lHxHti3tIo",
      data: {
        keyword1: {
          value: that.globalData.room_now.room.name,
          color: "#173177"
        },
        keyword2: {
          value: nickname + "发布了新内容",
          color: "#173177"
        }
      }
    };
    AV.Cloud
      .run('sendtplsms', paramsJson)
      .then((res_sendtplsms) => {
        // 调用成功，得到成功的应答 data
        console.log('sendtplsms' + res_sendtplsms);
        success(res_sendtplsms);
      }).catch((error) => {
        // 处理调用失败
        console.log("sendtplsms失败," + error);
        // cb('授权登录失败');
        fail(error);
      });
  },

  sendtplsms_new_student: function (success, fail) {
    var that = this;
     var nickname = that.globalData.room_now.nickname;
    if (!nickname) {
      nickName=that.globalData.room_now.student.nickName;
    }
    var paramsJson = {
      pushkey: that.globalData.room_now.room.objectId,
      studentid: that.globalData.logined_student.objectId,
      pushtype: 'newstudent',
      template_id: "oAa6Ylf-8pdIHnj5uKKWj6fR63ZUL1eY1lHxHti3tIo",
      data: {
        keyword1: {
          value: that.globalData.room_now.room.name,
          color: "#173177"
        },
        keyword2: {
          value: nickName + "加入啦",
          color: "#173177"
        }
      }
    };
    AV.Cloud
      .run('sendtplsms', paramsJson)
      .then((res_sendtplsms) => {
        // 调用成功，得到成功的应答 data
        console.log('sendtplsms' + res_sendtplsms);
        success(res_sendtplsms);
      }).catch((error) => {
        // 处理调用失败
        console.log("sendtplsms失败," + error);
        // cb('授权登录失败');
        fail(error);
      });

  },
  updateUserSended: function (isClear) {
    var that = this;
    var creater = AV.Object.createWithoutData('Student', that.globalData.logined_student.objectId);
    //如果是24小时内之前发送的,则更新累加发送条数，但是不更新最后发送时间。
    if (!isClear&&utils.isToday(that.globalData.logined_student.lastsendedtime)) {
      //更新登录用户的当天发帖次数
      creater.increment('todaysended', 1);
      // creater.set('lastsendedtime', Date.parse(new Date()));
      creater.fetchWhenSave(true);
      creater.save().then(function (res) {
        that.globalData.logined_student.todaysended = res.get('todaysended');
        // that.globalData.logined_student.lastsendedtime= res.get('lastsendedtime');
        console.log('todaysended succ: ' + res.get('todaysended'));
      }, function (error) {
        // 异常处理
        console.error('fale: ' + error);
      })
    } else {
      //如果超过了24小时的，则清零次数和并且发送时间
      creater.set('todaysended', 1);
      creater.set('lastsendedtime', new Date());
      creater.fetchWhenSave(true);
      creater.save().then(function (res) {
        that.globalData.logined_student.todaysended = res.get('todaysended');
        that.globalData.logined_student.lastsendedtime = res.get('lastsendedtime');
        console.log('todaysended succ: ' + res.get('todaysended'));
      }, function (error) {
        // 异常处理
        console.error('fale: ' + error);
      })
    }
  }

})



