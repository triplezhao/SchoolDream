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
    jioned_room_map: {},//存储班级里匿名
    jioned_room_queue_map: {},//存储每个班级的通知数
    jioned_room_unreadcount_map: {},//存储每个班级的通知数
    queue_count: 0,
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
    }, 15000);
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

    var that = this;

    if (!getApp().globalData.logined_student) {
      return;
    }
    // 页面显示
    console.log('onShow');
    if (getApp().globalData.refesh_change_home) {
      getApp().globalData.refesh_change_home = false;
      this.loadRooms();
    }

    //加载我的通知总数
    that.loadQueueCount();

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
          that.data.jioned_room_unreadcount_map[room.objectId] = 0;
          getApp().globalData.jioned_room_map = that.data.jioned_room_map;
          // scm=JSON.parse(JSON.stringify(scm)); 不起作用，去外面用数组的JSON.parse
          // scm=scm.toJSON();不起作用， 踏实用JSON.parse吧
        });
        console.log('before JSON.parse', student2Rooms);

        // //解析成json标准对象存储
        student2Rooms = JSON.parse(JSON.stringify(student2Rooms));
        // student2Rooms = student2Rooms.toJSON(); //数组没这个方法

        console.log('after JSON.parse', student2Rooms);

        that.loadUnreadCount(student2Rooms, 0);
        //更新界面
        that.setData({
          list: student2Rooms,
        })

        console.log('is_from_share=' + getApp().globalData.is_from_share);
        if (getApp().globalData.is_from_share) {

          getApp().globalData.is_from_share = false;
          wx.navigateTo({
            url: '../blackboard/blackboard'
          })
        }

      } else {
        that.hideLoading();
      }
    }).catch(function (error) {
      that.hideLoading();
      console.log(error);
    })
  },

  //加载每个房间的通知数
  loadQueueCount: function () {
    var that = this;
    var query = new AV.Query('WxPushQueue');
    query.equalTo('studentid', that.data.student.objectId);
    query.equalTo('pushtype', 'newarticle');
    query.find().then(function (results) {
      console.log(results);
      results.forEach(function (element) {
        var pushkey = element.get('pushkey');
        var counttmp = that.data.jioned_room_queue_map[pushkey];
        if (!counttmp) {
          counttmp = 0;
        }
        that.data.jioned_room_queue_map[pushkey] = counttmp + 1;
      }, this);

      console.log(that.data.jioned_room_queue_map);
      that.setData({
        jioned_room_queue_map: that.data.jioned_room_queue_map,
      });
      that.hideLoading();
    }, function (error) {
      console.log(error);
      that.hideLoading();
    });
  },


  //加载每个房间的未读数
  loadUnreadCount: function (student2rooms, i, onlyone) {
    var that = this;
    var element = student2rooms[i];
    var roomid = element.room.objectId;
    var room = AV.Object.createWithoutData('Room', roomid);
    var lasttime = element.lasttime;
    console.log(lasttime);
    console.log(new Date(lasttime));
    console.log(element.room.updatedAt);
    var query = new AV.Query('Article');
    query.equalTo('room', room);
    query.greaterThan('updatedAt', new Date(lasttime));
    query.count().then(function (count) {
      console.log('roomid=' + roomid + '，unreadcount=' + count);
      that.data.jioned_room_unreadcount_map[roomid] = count;
      that.setData({
        jioned_room_unreadcount_map: that.data.jioned_room_unreadcount_map,
      });
      if (onlyone) {
        return;
      }
      i++;
      if (i < student2rooms.length) {
        that.loadUnreadCount(student2rooms, i);
      }
    }, function (error) {
      if (onlyone) {
        return;
      }
      i++;
      console.log(error);
      if (i < student2rooms.length) {
        that.loadUnreadCount(student2rooms, i);
      }
    });

  },

  enter2Room: function (student2room) {
    var that = this;
    //改全局内存
    getApp().globalData.room_now = student2room;
    // getApp().globalData.room_now.lasttime=Date.parse(new Date());

    wx.navigateTo({
      url: '../blackboard/blackboard'
    })

  },

  updateUnreadCount: function (student2rooms, index) {
    var that = this;
    var student2room = AV.Object.createWithoutData('Student2Room', that.data.list[index].objectId);
    student2room.set('lasttime', Date.parse(new Date()));
    student2room.fetchWhenSave(true);
    student2room.save().then(function (student2room) {
      // 使用了 fetchWhenSave 选项，save 成功之后即可得到最新的 views 值
      that.data.list[index].lasttime = student2room.get('lasttime');
      that.loadUnreadCount(that.data.list, index, true);
    }, function (error) {
      // 异常处理
    });

  },


  showActionSheet: function (e) {

    // var index = e.currentTarget.dataset.index;
    var index = '';
    if (e.detail.formId) {
      index = e.detail.value.index;
    } else {
      index = e.currentTarget.dataset.index;
    }

    var formId = e.detail.formId;
    console.log('点击了列表的：', index)
    var that = this;
    that.enter2Room(that.data.list[index]);

    that.updateUnreadCount(that.data.list, index);


    if (formId && !isNaN(formId)) {
      //获取openid,利用leancloud的云函数.https://leancloud.cn/docs/leanengine_cloudfunction_guide-node.html#Hook_函数
      //注册一个接收通知
      var data = {
        touser: getApp().globalData.logined_student.openid,
        // template_id: "def",
        page: "pages/home/home",
        form_id: formId,
        data: {}
      }
      var wxPushQueue = new AV.Object('WxPushQueue');
      wxPushQueue.set('studentid', getApp().globalData.logined_student.objectId);//注册的人objectId
      wxPushQueue.set('pushtype', 'newarticle');//注册一个 加入房间提醒，其他人加入房间后，我会收到一次推送消息
      wxPushQueue.set('pushkey', that.data.list[index].room.objectId);//这种类型的key为房间id
      wxPushQueue.set('pushdata', JSON.stringify(data));
      wxPushQueue.save().then(function (res_wxPushQueue) {
        console.log('wxPushQueue succ');

      }, function (error) {
        // 异常处理
        console.log('error ', error);
      });
      //注册一个接收通知end
    }


  },

  onShareAppMessage: function () {
    return {
      title: getApp().globalData.logined_student.nickname + '喊你加入校友录',
      desc: getApp().globalData.logined_student.nickname + '喊你加入校友录',
      path: '/pages/home/home'
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
  //搜索班级页面
  tapCheck: function () {
    wx.navigateTo({
      url: '../check/check'
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