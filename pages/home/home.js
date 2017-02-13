const AV = require('../../utils/leancloud-storage');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const utils = require('../../utils/util.js');

var a = '1111111111111'
Page({
  data: {

    // 是否显示loading
    showLoading: true,
    // loading提示语
    loadingMessage: '',
    // 提示消息
    toastMessage: '',
    text: "Page wode",
    actionSheetHidden: true,
    actionSheetObj: null,
    student: null,
    list: [],
    schooltypes_short: ['大学', '高中', '初中', '小学', '幼儿园', '其他'],
    jioned_room_map: {},
  },


  onLoad: function (options) {
    let that = this;
    // var output = Mustache.render("{{#bold}}Hi {{name}}.{{/bold}}", data);
    // that.data.gettime = 

    console.log('onLoad');
    wx.hideNavigationBarLoading();

    that.relogin();

  },

  relogin: function () {
    //放到appjs里面加载不可以， app与page会同时加载

    this.showLoading('加载中');
    setTimeout(() => {
      this.hideLoading();
    }, 7000);
    getApp().checkLoginStatus((code, data) => {
      if (code == 1) {
        this.setData({
          student: data,
        });
        this.loadRooms();
      } else {
        console.log('studentLogin', data);
        this.hideLoading();
      }
    });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    if (!getApp().globalData.logined_student) {
      return;
    }
    // 页面显示
    console.log('onShow');
    if (getApp().globalData.refesh_change_home) {
      getApp().globalData.refesh_change_home = false;
      this.loadRooms();
    }
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
    this.loadRooms();
  },

  loadRooms: function () {

    console.log('start loadRooms===========');
    var that = this;
    that.showLoading('加载房间列表');

    if (!getApp().globalData.logined_student) {
      //更新界面
      that.hideLoading();
      return;
    }

    // 查询Student2Room
    var query = new AV.Query('Student2Room');
    var student = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);

    // 查询当前登录用户加入的room
    query.equalTo('student', student);

    query.include('student,room');

    // query.descending('createdAt');
    query.ascending('createdAt');

    console.log('query.find()===========');
    // 执行查询
    query.find().then(function (student2Rooms) {
      //嵌套的子对象，需要JSON.parse(JSON.stringify 重新赋值成json对象。

      console.log('then===========', student2Rooms);
      getApp().globalData.jioned_room_map = {};
      that.data.jioned_room_map = {};
      that.setData({
        jioned_room_map: {}
      })
      if (student2Rooms) {
        student2Rooms.forEach(function (scm, i, a) {

          // console.log(scm.room.name);
          scm.set('student', JSON.parse(JSON.stringify(scm.get('student'))));

          let room = scm.get('room');
          room.set('yyyymmdd', utils.yyyymmdd(room.get('createdAt')));
          room = JSON.parse(JSON.stringify(room));
          scm.set('room', room);
          // scm=JSON.parse(JSON.stringify(room));
          // getApp().globalData.jioned_room_map[room.objectId] = scm;
          that.data.jioned_room_map[room.objectId] = scm;
          getApp().globalData.jioned_room_map = that.data.jioned_room_map;
          // scm=JSON.parse(JSON.stringify(scm)); 不起作用，去外面用数组的JSON.parse
          // scm=scm.toJSON();不起作用， 踏实用JSON.parse吧
        });
        console.log('before JSON.parse', student2Rooms);

        // //解析成json标准对象存储
        student2Rooms = JSON.parse(JSON.stringify(student2Rooms));
        // student2Rooms = student2Rooms.toJSON(); //数组没这个方法

        console.log('after JSON.parse', student2Rooms);


        //更新界面
        that.setData({
          list: student2Rooms,
        })
        that.hideLoading();
      } else {
        that.hideLoading();
      }
    }).catch(function (error) {
      that.hideLoading();
      console.log(error);
    })
  },

  enter2Room: function (student2room) {
    var that = this;
    //改全局内存
    getApp().globalData.room_now = student2room;

    wx.navigateTo({
      url: '../blackboard/blackboard'
    })

  },


  showActionSheet: function (e) {

    var index = e.currentTarget.dataset.index;
    console.log('点击了列表的：', index)
    var that = this;
    that.enter2Room(that.data.list[index]);
    // wx.showActionSheet({
    //   itemList: ['进入', '班级管理'],
    //   success: function (res) {
    //     if (!res.cancel) {
    //       console.log(res.tapIndex)
    //       switch (res.tapIndex) {
    //         case 0:
    //           that.enter2Room(that.data.list[index]);
    //           break;
    //         case 1:
    //           //改全局内存
    //           getApp().globalData.room_now = that.data.list[index];
    //           wx.navigateTo({
    //             url: '../roomsetting/roomsetting'
    //           })

    //           break;
    //         case 2:
    //           that.onShareAppMessage()
    //           // that.showToast('真机分享不能用，通知好友使用搜索');
    //           // wx.navigateTo({
    //           //   url: '../invite/invite?invitecode=' + that.data.list[index].room.objectId
    //           // })
    //           break;
    //       }
    //     }
    //   },
    // })
  },

  onShareAppMessage: function () {
    return {
      title: '朋小圈校友录',
      desc: getApp().globalData.logined_student.nickname + '喊你加入校友录',
      path: '/pages/home/home'
      // path: '/pages/jionroom/jionroom?name=' + getApp().globalData.room_now.room.name + '&objectId=' + getApp().globalData.room_now.room.objectId
      // + '&question=' + getApp().globalData.room_now.room.question + '&answer=' + getApp().globalData.room_now.room.answer + '&picurl=' + getApp().globalData.room_now.room.picurl
    }
  },

  //跳转到创建页面
  tapCreateRoom: function () {
    wx.navigateTo({
      url: '../createroom/createroom'
    })

  },

  //搜索班级页面
  tapSearchRoom: function () {
    wx.navigateTo({
      url: '../searchroom/searchroom'
    })

  },
  // 显示loading提示
  showLoading(loadingMessage) {
    this.setData({ showLoading: true, loadingMessage: loadingMessage ? loadingMessage : '加载中' });
  },

  // 隐藏loading提示
  hideLoading() {
    this.setData({ showLoading: false, loadingMessage: '' });
  },

  // 显示toast消息
  showToast(toastMessage) {
    wx.showToast({
      title: toastMessage,
      duration: 1000
    })
  },


})