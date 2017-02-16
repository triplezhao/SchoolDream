const AV = require('../../utils/leancloud-storage');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');
const WxPushQueue = require('../../model/WxPushQueue');

Page({
  data: {
    text: "Page jionclassroom",
    student: null,
    name: '',
    objectId: '',
    question: '',
    answer: '',
    picurl: '',
    isshare: false,

    nickname: '',
    input_answer: '',

    // 是否显示loading
    showLoading: true,
    // loading提示语
    loadingMessage: '',
    // 提示消息
    toastMessage: '',
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    let that = this;
    wx.hideNavigationBarLoading();
    wx.setNavigationBarTitle({ title: '加入班级：' + options.name });
    this.setData({
      name: options.name,
      objectId: options.objectId,
      question: options.question,
      answer: options.answer,
      picurl: options.picurl,
      isshare: options.isshare == "true",
    })

    //如果是分享过来的，则需要先登录
    that.relogin();

  },

  relogin: function () {
    let that = this;
    //放到appjs里面加载不可以， app与page会同时加载
    this.showLoading('加载中');
    setTimeout(() => {
      this.hideLoading();
    }, 7000);
    getApp().checkLoginStatus((code, data) => {
      this.hideLoading();
      console.log('studentLogin', data);
      if (code == 1) {
        this.setData({
          student: data,
        });
        that.checkAlready();
      } else {
        // console.log('studentLogin', data);
      }
    });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  showLoading(loadingMessage) {
    this.setData({ showLoading: true, loadingMessage: loadingMessage ? loadingMessage : '加载中' });
  },

  // 隐藏loading提示
  hideLoading() {
    // setTimeout(() => {
    this.setData({ showLoading: false, loadingMessage: '' });
    // }, 200);
  },

  // 显示toast消息
  showToast(toastMessage) {
    wx.showToast({
      title: toastMessage,
      duration: 1000
    })
  },

  //跳转到加入页面
  // tapJionRoom: function (e) {
  tapJionRoom: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    // var content = e.detail.value.content;
    var formId = e.detail.formId;
    console.log('form发生了submit事件，携带数据为formId：', e.detail.formId);

    let that = this;
    if (!getApp().globalData.logined_student) {
      that.showLoading('加载中');
      getApp().checkLoginStatus((code, data) => {
        that.hideLoading();
        if (code == 1) {
          console.log('studentLogin', data);
        } else {
          //注册失败，直接返回。
          that.showToast('无法获取用户信息');
          return;
        }
      });
    };


    if (!that.data.nickname) {
      that.showToast('请填写本班昵称');
      return;
    }
    if (!that.data.input_answer) {
      that.showToast('请填写验证答案');
      return;
    }


    //先查询是否存在这个room
    var room = AV.Object.createWithoutData('Room', that.data.objectId);
    var query = new AV.Query('Room');
    query.equalTo('objectId', that.data.objectId);
    query.include('creater');

    that.showLoading('正在加载');

    query.first().then(function (res_room) {
      console.log(res_room);
      //存在room，
      if (res_room) {

        //验证答案
        if (!that.checkAnswer()) {
          that.hideLoading();
          that.showToast('填写的答案不对，禁止加入')
          return;
        }

        console.log('check if  all ready jionin');
        //检查是否已经加入了

        var query1 = new AV.Query('Student2Room');
        query1.equalTo('room', room);

        var query2 = new AV.Query('Student2Room');
        var student = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);
        query2.equalTo('student', student);

        var query = AV.Query.and(query1, query2);

        query.include('room,student');

        query.first().then(function (res_student2room) {
          console.log(res_student2room);
          if (res_student2room == undefined) {

            //create a new Student2Room
            var newstudent2room = new AV.Object('Student2Room');
            newstudent2room.set('nickname', that.data.nickname);
            newstudent2room.set('student', student);
            newstudent2room.set('room', room);
            console.log('go to create new student2room');
            newstudent2room.fetchWhenSave(true);
            newstudent2room.save().then(function (res_newstudent2room) {
              console.log('create new student2room succ');

              //更新班级人数
              res_room.increment('usercount', 1);
              res_room.fetchWhenSave(true);
              res_room.save().then(function (res) {
                // 成功
                that.showToast('加入成功');
                that.hideLoading();

                res_newstudent2room.set('student', getApp().globalData.logined_student);
                res_newstudent2room.set('room', JSON.parse(JSON.stringify(res_room)));
                res_newstudent2room = JSON.parse(JSON.stringify(res_newstudent2room));

                getApp().globalData.refesh_change_home = true;
                getApp().globalData.is_from_share = that.data.isshare;
                getApp().globalData.room_now = res_newstudent2room;

                //本地拼好，发到server
                // {
                //   "touser": "OPENID",  
                //   "template_id": "TEMPLATE_ID", 
                //   "page": "index",          
                //   "form_id": "FORMID",         
                //   "data": {
                //       "keyword1": {
                //           "value": "339208499", 
                //           "color": "#173177"
                //       }, 
                //       "keyword2": {
                //           "value": "2015年01月05日 12:30", 
                //           "color": "#173177"
                //       }, 
                //       "keyword3": {
                //           "value": "粤海喜来登酒店", 
                //           "color": "#173177"
                //       } , 
                //       "keyword4": {
                //           "value": "广州市天河区天河路208号", 
                //           "color": "#173177"
                //       } 
                //   },
                //   "emphasis_keyword": "keyword1.DATA" 
                // }
                //获取openid,利用leancloud的云函数.https://leancloud.cn/docs/leanengine_cloudfunction_guide-node.html#Hook_函数
                var paramsJson = {
                  pushkey: res_room.id,
                  pushtype: 'newstudent',
                  template_id: "oAa6Ylf-8pdIHnj5uKKWj6fR63ZUL1eY1lHxHti3tIo",
                  data: {
                    keyword1: {
                      value: that.data.nickname,
                      color: "#173177"
                    },
                    keyword2: {
                      value: that.data.nickname + "加入了班级:" + res_room.get("name"),
                      color: "#173177"
                    }
                  }
                };

                getApp().sendtplsms_new_student(
                  function (success) {
                    //注册一个接收通知end
                    var data = {
                      touser: getApp().globalData.logined_student.openid,
                      // template_id: "def",
                      page: "pages/home/home",
                      form_id: formId,
                      data: {}
                    }
                    var wxPushQueue = new AV.Object('WxPushQueue');
                    wxPushQueue.set('studentid', getApp().globalData.logined_student.objectId);//注册的人objectId
                    wxPushQueue.set('pushtype', 'newstudent');//注册一个 加入房间提醒，其他人加入房间后，我会收到一次推送消息
                    wxPushQueue.set('pushkey', res_room.id);//这种类型的key为房间id
                    wxPushQueue.set('pushdata', JSON.stringify(data));
                    wxPushQueue.save().then(function (res_wxPushQueue) {
                      console.log('wxPushQueue succ');

                    }, function (error) {
                      // 异常处理
                      console.log('error ', error);
                    });
                    //注册一个接收通知end
                  },
                  function (error) {
                    // 异常处理
                    console.log('error ', error);
                  }
                );


                if (that.data.isshare) {
                  wx.redirectTo({
                    // url: '../blackboard/blackboard'
                    url: '/pages/home/home'
                  })
                } else {
                  wx.redirectTo({
                    url: '../blackboard/blackboard'
                  })
                }
              }, function (error) {
                // 异常处理
                console.log('error ', error);
              });

            });
          } else {
            console.log('do nothing');
            //重复加入错误
            that.showToast('您已经加入这个班级')
            that.hideLoading();
            res_student2room.set('student', getApp().globalData.logined_student);
            res_student2room.set('room', JSON.parse(JSON.stringify(res_student2room.get('room'))));
            res_student2room = JSON.parse(JSON.stringify(res_student2room));

            getApp().globalData.refesh_change_home = true;
            getApp().globalData.is_from_share = that.data.isshare;
            getApp().globalData.room_now = res_student2room;

            if (that.data.isshare) {
              wx.redirectTo({
                // url: '../blackboard/blackboard'
                url: '/pages/home/home'
              })
            } else {
              wx.redirectTo({
                url: '../blackboard/blackboard'
              })
            }
          }

        }, function (error) {
          console.log('error:', error);
          that.hideLoading();
        });

      } else {
        console.log('do nothing');
        //不存在此班级
        that.showToast('不存在此班级')
        that.hideLoading();
      }

    }, function (error) {
      console.log('error:', error);
      that.hideLoading();
    });


  },

  checkAnswer: function () {
    return this.data.input_answer == this.data.answer;
  },

  bindKeyInputNickname: function (e) {
    this.setData({
      nickname: e.detail.value
    })
  },
  bindKeyInputAnswer: function (e) {
    this.setData({
      input_answer: e.detail.value
    })
  },

  checkAlready: function () {
    let that = this;
    //先查询是否存在这个room
    var room = AV.Object.createWithoutData('Room', that.data.objectId);

    var query1 = new AV.Query('Student2Room');
    query1.equalTo('room', room);

    var query2 = new AV.Query('Student2Room');
    var student = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);
    query2.equalTo('student', student);

    var query = AV.Query.and(query1, query2);
    query.include('student,room');
    //create a new Student2Room
    // var student2room = new AV.Object('Student2Room');
    // student2room.set('nickname', that.data.nickname);
    // student2room.set('student', student);
    // student2room.set('room', room);
    that.showLoading();
    query.first().then(function (student2room) {
      console.log(student2room);
      if (student2room == undefined) {

        console.log('do nothing');
        that.hideLoading();
      } else {

        //重复加入错误
        that.showToast('您已经加入这个班级')
        that.hideLoading();

        student2room.set('student', JSON.parse(JSON.stringify(student2room.get("student"))));
        student2room.set('room', JSON.parse(JSON.stringify(student2room.get("room"))));
        student2room = JSON.parse(JSON.stringify(student2room));
        setTimeout(() => {
          getApp().globalData.refesh_change_home = true;
          getApp().globalData.is_from_share = that.data.isshare;
          getApp().globalData.room_now = student2room;

          if (that.data.isshare) {
            wx.redirectTo({
              // url: '../blackboard/blackboard'
              url: '/pages/home/home'
            })
          } else {
            wx.redirectTo({
              url: '../blackboard/blackboard'
            })
          }

        }, 600);
      }

    }, function (error) {
      console.log('error:', error);
      that.hideLoading();
    });
  }

})