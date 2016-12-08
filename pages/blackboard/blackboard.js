const AV = require('../../utils/leancloud-storage.js');
const QN = require('../../utils/qiniuutil.js');

Page({
  data: {
    list: [],
    maxtime: 0,
    total: 0,
    // size: 20,
    hasMore: false,
    isLoading: false,
    room_now: null,
    hideContent: false,
    hideError: true
  },

  onLoad: function (options) {

    //app房间为空，则提示错误信息
    this.checkLogin();
    
    // 页面初始化 options为页面跳转所带来的参数
    this.refesh();

  },

  onReady: function () {
    // 页面渲染完成
    console.log("onReady");
    // this.onShow();
  },
  onShow: function () {
    // 页面显示
    console.log("onShow");
    this.checkLogin();

  },
  onHide: function () {
    // 页面隐藏
    console.log("onHide");
  },
  onUnload: function () {
    // 页面关闭
    console.log("onUnload");
  },


  /**
   * 上拉刷新
   */
  onPullDownRefresh: function () {
    //加载最新
    this.refesh();
  },
  /**
   * 滚动到底部时加载下一页
   */
  bindscrolltolower: function () {
    console.log('到底部')
    this.loadMore();

  },


  //刷新处理
  refesh: function (e) {
    var that = this;
    that.setData({
      isLoading: true
    });
    // 
    var query = new AV.Query('Article');
    var room = AV.Object.createWithoutData('Room', that.data.room_now.room.objectId);

    // 查询当前登录用户加入的room
    query.equalTo('room', room);

    query.include('creater,room');

    // 执行查询
    query.find().then(function (results) {
      //嵌套的子对象，需要JSON.parse(JSON.stringify 重新赋值成json对象。
      if (results) {
        results.forEach(function (scm, i, a) {
          scm.set('creater', JSON.parse(JSON.stringify(scm.get('creater'))));
          scm.set('room', JSON.parse(JSON.stringify(scm.get('room'))));
          // scm=JSON.parse(JSON.stringify(scm));
        });
        console.log('before JSON.parse', results);

        //解析成json标准对象存储
        results = JSON.parse(JSON.stringify(results));

        console.log('after JSON.parse', results);
      var maxtime = that.data.maxtime;
            if(results.length>0){
                maxtime=results[results.length - 1].createAt;
            }

        //更新界面
        that.setData({
          // 拼接数组
          list: results,
          isLoading: false,
          maxtime: maxtime,
          // total: res.data.info.count
        })
        wx.stopPullDownRefresh();
      }
    });
  },


  //加载更多
  loadMore: function (e) {

    var that = this;
    that.setData({
      isLoading: true,
      list: []
    });
    // 
    var query = new AV.Query('Article');
    var room = AV.Object.createWithoutData('Room', that.data.room_now.objectId);

    // 查询当前登录用户加入的room
    query.equalTo('room', room);

    // 执行查询
    query.find().then(function (results) {
      //嵌套的子对象，需要JSON.parse(JSON.stringify 重新赋值成json对象。
      if (results) {
        // results.forEach(function (scm, i, a) {
        //   // scm.set('student', JSON.parse(JSON.stringify(scm.get('student'))));
        //   // scm.set('room', JSON.parse(JSON.stringify(scm.get('room'))));
        //   // scm=JSON.parse(JSON.stringify(scm));
        // });
        console.log('before JSON.parse', results);

        //解析成json标准对象存储
        results = JSON.parse(JSON.stringify(results));

        console.log('after JSON.parse', results);

        var maxtime = that.data.maxtime;
        if(results.length>0){
            maxtime=results[results.length - 1].createAt;
        }

        //更新界面
        that.setData({
          // 拼接数组
          list: that.data.list.concat(results),
          maxtime: maxtime,
          isLoading: false
        })
      }
    });
  },



  checkLogin:function(){
      var that = this;
    //app房间为空，则提示错误信息
    if (!getApp().globalData.room_now) {
      that.setData({
        hideContent: true,
        hideError: false,
      })
      return;
    }

    //当前page房间为空，或者 从我的页面进行了切换房间。则重新赋值
    if (!that.data.room_now || getApp().globalData.room_now_change_1) {

      getApp().globalData.room_now_change_1 = false;

      that.setData({
        room_now: getApp().globalData.room_now,
        hideContent: false,
        hideError: true
      })

      wx.setNavigationBarTitle({
        title: getApp().globalData.room_now.room.roomname,
      });

      that.refesh();
    }
  },
   //跳转到新建页面
  tapCreateArticle:function(e){
    wx.navigateTo({
      url: '../createarticle/createarticle'
    })
  },

})