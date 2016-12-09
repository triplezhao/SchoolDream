const AV = require('./utils/leancloud-storage');
const Student = require('./model/Student');

const weixinappId = 'wx34116c4aee4ca248';
AV.init({
  appId: 'bystxyLIuetNkwb2uGz9WYd1-gzGzoHsz',
  appKey: 'Yf3MMSSOWHSGI87ewfRNqd7E',
});


const KEY_LOGINED_STUDENT = 'KEY_LOGINED_STUDENT';

App({

  globalData: {
    logined_student: null,
    room_now: null,
    refesh_change_home: false,
  
  },
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    this.syncRoomNow();

  },

  syncRoomNow: function (cb) {
    console.log('syncRoomNow');

    this.globalData.room_now = wx.getStorageSync('room_now');
    this.globalData.logined_student = this.getStudentInfoFromLocal();

    if(!this.globalData.room_now){
      console.log('is not in room')
      return;
    }
    
    if(!this.globalData.logined_student){
      console.log('is not login')
      return;
    }

    //如果登录用户与本地的room的student指针指向的不一样，则设置本地为null
    if (this.globalData.room_now.student.objectId != this.globalData.logined_student.objectId) {
      console.log('room与登录用户不相等');
      this.globalData.room_now = null;
      wx.removeStorageSync('room_now');
    }
  },

  // getUserInfo: function (cb) {
  //   var that = this;
  //   if (this.globalData.logined_student) {
  //     typeof cb == "function" && cb(this.globalData.logined_student)
  //   } else {
  //     that.doRegister(cb);
  //   }
  // },

  logout: function (cb) {
    var that = this;
    //清除内存
    this.globalData.logined_student = null;
    that.clearStudentFromLocal();
  },

  //检查本地是否有已经登录的，如果没有，则进行登录（无论注册还是登录，都需要先走getUnionId的流程），
  //如果是已经注册的用户，则将微信的头像、昵称等信息更新到服务器student.save， 如果没注册本用户，则存储student.save，并且加入默认班级(两个区别只有这个)
  //
  //如果本地存在，则不需要登录和注册操作。（考虑什么时候进行更新）
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
      //重新登录
      that.weixinlogin(function (res, data) {
        console.log('收到回调', res);
        if (res == 1) {
          //存储student到local

          var student = new Student();


          //查询下是否已经注册了
          var query = new AV.Query(Student);
          query.equalTo('openId', data.openId);

          query.first().then(function (results) {

            if (results == undefined) {
              //没有注册，则添加新用户，
              student.set('phone', '0');
              console.log('未注册的用户: ');
            } else {
              console.log('已经注册的用户: ', results);
              //已经注册了的话，则更新
              student = results;

            }

            student.set('openId', data.openId);
            student.set('nickName', data.nickName);
            student.set('gender', data.gender);
            student.set('city', data.city);
            student.set('province', data.province);
            student.set('country', data.country);
            student.set('avatarUrl', data.avatarUrl);
            student.set('unionId', data.unionId);
            console.log('拼接后的student data: ', student.get('openId'));
            //存储student到leancloud
            return student.save();

          }).then(function (saved) {
            //更新内存
            that.globalData.logined_student = JSON.parse(JSON.stringify(saved));
            //无论是更新还是注册，都把返回的对象保存到本地
            that.saveStudent2Local(saved);
            console.log('注册或者更新完成，保存到本地: ', saved);
            cb(1, saved);
          }, function (error) {
            cb(0, "保存失败")
          });

        } else {
          cb(0, "网络失败")
        }
      });
    }
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

  //从微信登录开始进行登录。 第一步获取wx.login，第二步获取openid，第三步获取unionid。
  weixinlogin: function (cb) {
    var that = this;
    //调用登录接口
    wx.login({
      success: function (wxlogin_res) {
        if (wxlogin_res.code) {
          //发起网络请求获取用户信息
          console.log("wx.login:" + wxlogin_res.code);

          wx.getUserInfo({
            success: function (wxgetUserInfo_res) {
              console.log("wxgetUserInfo_res:");
              console.log(wxgetUserInfo_res);

              that.getOpenId2UnionId(wxlogin_res.code, weixinappId, wxgetUserInfo_res.encryptedData, wxgetUserInfo_res.iv, cb);

            }
          })
        } else {
          console.log(' wx.login 获取用户登录态失败！' + wxlogin_res.errMsg);
          cb(0, '授权登录失败');
        }
      }
    });
  },

  //
  getOpenId2UnionId: function (jscode, appId, encryptedData, iv, cb) {

    var paramsJson = {
      jscode: jscode
    };
    //获取openid,利用leancloud的云函数.https://leancloud.cn/docs/leanengine_cloudfunction_guide-node.html#Hook_函数
    AV.Cloud
      .run('acl', paramsJson)
      .then(function (data) {
        // 调用成功，得到成功的应答 data
        console.log('acl' + data);

        var decodeparamsJson = {
          appId: appId,
          encryptedData: encryptedData,
          sessionKey: data.session_key,
          iv: iv
        };
        //获取unionid
        return AV.Cloud
          .run('decode', decodeparamsJson);

      }, function (err) {
        // 处理调用失败
        console.log("acl失败," + err);
        cb(0, '授权登录失败');
      }).then(function (data) {

        //成功
        console.log('服务器解密后 data: ', JSON.parse(data));
        cb(1, JSON.parse(data));

      }, function (err) {
        // 处理调用失败
        console.log("decode失败," + err);
        cb(0, '授权登录失败');
      });
  }

})



