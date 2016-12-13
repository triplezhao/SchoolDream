const AV = require('../../utils/leancloud-storage');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');

Page({
  data: {
    text: "Page wode",
    student: null,
    room_now: null,
    list: []
  },
  onLoad: function (options) {
    wx.hideNavigationBarLoading();
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    //改本业内存
    that.setData({
      room_now: getApp().globalData.room_now,
      student: getApp().globalData.logined_student,
    })
    wx.setNavigationBarTitle({
      title: '当前班级：' + getApp().globalData.room_now.room.roomname,
    });

    this.loadStudents();

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    wx.setNavigationBarTitle({
      title: '当前班级：' + getApp().globalData.room_now.room.roomname,
    });
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  /**
    * 上拉刷新
    */
  onPullDownRefresh: function () {
    //加载最新
    this.loadStudents();
  },

  loadStudents: function () {
    var that = this;
    // 查询Student2Room
    var query = new AV.Query('Student2Room');
    var room = AV.Object.createWithoutData('Room', getApp().globalData.room_now.room.objectId);

    // 查询当前登录用户加入的room
    query.equalTo('room', room);
    query.include('student,room');
    // query.descending('createdAt');

    // 执行查询
    query.find().then(function (student2Rooms) {
      //嵌套的子对象，需要JSON.parse(JSON.stringify 重新赋值成json对象。
      if (student2Rooms) {
        student2Rooms.forEach(function (scm, i, a) {
          scm.set('student', JSON.parse(JSON.stringify(scm.get('student'))));
          scm.set('room', JSON.parse(JSON.stringify(scm.get('room'))));
          // scm=JSON.parse(JSON.stringify(scm));
        });
        console.log('before JSON.parse', student2Rooms);

        //解析成json标准对象存储
        student2Rooms = JSON.parse(JSON.stringify(student2Rooms));

        console.log('after JSON.parse', student2Rooms);

        //更新界面
        that.setData({
          list: student2Rooms,
          islogin: true,
        })
      }
    }, function (error) {
      console.log(error);
    });
  },
  //跳转到加入页面
  tapInvite: function () {
    var that = this;
    wx.navigateTo({
      url: '../invite/invite?invitecode=' + getApp().globalData.room_now.room.objectId
    })

  },


  //解散房间
  tapOutRoom: function (e) {
    var that = this;
    var room = AV.Object.createWithoutData('Student2Room', that.data.room_now.objectId);
    room.destroy().then(function (success) {
      console.log(success);
      // 删除成功,云函数会处理 关联的删除操作
      getApp().globalData.refesh_change_home = true;

      wx.navigateBack();

    }, function (error) {
      // 删除失败
      console.log(error);
    });

  },
  //解散房间
  tapDelRoom: function (e) {
    var that = this;
    var room = AV.Object.createWithoutData('Room', that.data.room_now.room.objectId);
    room.destroy().then(function (success) {
      console.log(success);
      // 删除成功,云函数会处理 关联的删除操作
      getApp().globalData.refesh_change_home = true;

      wx.navigateBack();

    }, function (error) {
      // 删除失败
      console.log(error);
    });

  },


})