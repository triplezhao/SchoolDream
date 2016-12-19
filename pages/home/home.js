const AV = require('../../utils/leancloud-storage');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');

Page({
  data: {
    // 是否显示loading
    showLoading: false,
    // loading提示语
    loadingMessage: '',
    // 提示消息
    toastMessage: '',
    text: "Page wode",
    actionSheetHidden: true,
    actionSheetObj: null,
    student: null,
    list: [],

  },
  onLoad: function (options) {
    let that = this;
    console.log('onLoad');
    wx.hideNavigationBarLoading();
    // 页面初始化 options为页面跳转所带来的参数

    if (getApp().globalData.logined_student) {
      //改本业内存
      that.setData({
        student: getApp().globalData.logined_student
      })
      that.hideLoading();
    }

    that.showLoading('加载中');

    getApp().studentLogin((code, data) => {
      if (code==1) {
        that.setData({
          student: data,
        });
        that.loadRooms();
      } else {
        console.log('studentLogin',data);
        that.hideLoading();
      }
    });
  },

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    console.log('onShow');
    if (getApp().globalData.refesh_change_home) {
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

    query.descending('createdAt');

    console.log('query.find()===========');
    // 执行查询
    query.find().then(function (student2Rooms) {
      //嵌套的子对象，需要JSON.parse(JSON.stringify 重新赋值成json对象。
      that.hideLoading();
      wx.stopPullDownRefresh();
      console.log('then===========', student2Rooms);
      if (student2Rooms) {
        student2Rooms.forEach(function (scm, i, a) {
          
          // console.log(scm.room.name);
          scm.set('student', JSON.parse(JSON.stringify(scm.get('student'))));
          scm.set('room', JSON.parse(JSON.stringify(scm.get('room'))));
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
    wx.showActionSheet({
      itemList: ['进入', '邀请同学', '设置'],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)
          switch (res.tapIndex) {
            case 0:
              that.enter2Room(that.data.list[index]);
              break;
            case 1:
              wx.navigateTo({
                url: '../invite/invite?invitecode=' + that.data.list[index].room.objectId
              })
              break;
            case 2:
              //改全局内存
              getApp().globalData.room_now = that.data.list[index];
              wx.navigateTo({
                url: '../roomsetting/roomsetting'
              })
              break;
          }
        }
      },
    })
  },

  //跳转到创建页面
  tapCreateRoom: function () {
    wx.navigateTo({
      url: '../createroom/createroom'
    })

  },
  //跳转到加入页面
  tapJionRoom: function () {
    wx.navigateTo({
      url: '../jionroom/jionroom'
    })

  },
  // 显示loading提示
  showLoading(loadingMessage) {
    this.setData({ showLoading: true, loadingMessage:loadingMessage?loadingMessage:'加载中' });
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