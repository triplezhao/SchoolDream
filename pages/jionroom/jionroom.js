const AV = require('../../utils/leancloud-storage');
const QN = require('../../utils/qiniuutil.js');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');

Page({
  data: {
    text: "Page jionclassroom"
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    wx.hideNavigationBarLoading();

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
  formSubmit: function (e) {
    var that = this;


    var invitationcode = e.detail.value.invitationcode;
    var nickname = e.detail.value.nickname;


    if (!invitationcode) {
      wx.showToast({
        title: '邀请码不能为空',
        icon: 'success',
        duration: 1000
      })
      return;
    }
    if (!nickname) {
      wx.showToast({
        title: 'nickname不能为空',
        icon: 'success',
        duration: 1000
      })
      return;
    }

    console.log('form发生了submit事件，携带数据为：', invitationcode)


    //先查询是否存在这个room
    var room = AV.Object.createWithoutData('Room', invitationcode);
    var query = new AV.Query('Room');
    query.equalTo('objectId', invitationcode);
    query.first().then(function (result) {
      console.log(result);
      //存在room，
      if (result) {
        console.log('check if  all ready jionin');
        //检查是否已经加入了

        var query1 = new AV.Query('Student2Room');
        query1.equalTo('room', room);

        var query2 = new AV.Query('Student2Room');
        var student = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);
        query2.equalTo('student', student);

        var query = AV.Query.and(query1, query2);

        //create a new Student2Room
        var student2room = new AV.Object('Student2Room');
        student2room.set('nickname', nickname);
        student2room.set('student', student);
        student2room.set('room', room);

        query.first().then(function (results) {
          console.log(results);
          if (results == undefined) {
            //
            console.log('go to create new student2room');

            student2room.save().then(function (data) {

              console.log('create new student2room succ');
              wx.showToast({
                title: '加入成功',
                icon: 'success',
                duration: 2000
              })
              getApp().globalData.refesh_change_home = true;

              wx.navigateBack();
            });

          } else {
            console.log('do nothing');
            //重复加入错误
            wx.showToast({
              title: '重复加入错误',
              icon: 'fail',
              duration: 2000
            })

          }

        }, function (error) {
          console.log('error:', error);
        });

      } else {
        console.log('do nothing');
        //不存在此班级
        wx.showToast({
          title: '不存在此班级',
          icon: 'fail',
          duration: 2000
        })
      }

    }, function (error) {
      console.log('error:', error);
    });

  },

})