const AV = require('../../utils/leancloud-storage.js');
const QN = require('../../utils/qiniuutil.js');
const utils = require('../../utils/util.js');

const pageSize = 5;

Page({
  data: {
    list: [],
    maxtime: utils.getTs(new Date()),
    total: 0,
    // size: 20,
    hasMore: true,
    isLoading: false,
    room_now: null,
    hideContent: false,
    hideError: true
  },

  onLoad: function (options) {

    // //app房间为空，则提示错误信息
    // this.checkLogin();

    // 页面初始化 options为页面跳转所带来的参数
    // this.refesh();

  },

  onReady: function () {
    // 页面渲染完成
    console.log("onReady");
    // this.onShow();
  },
  onShow: function () {
    // 页面显示
    console.log("onShow");
    if(getApp().globalData.refesh_change_1){
        getApp().globalData.refesh_change_1=false;
        this.refesh();
    }
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
      isLoading: true,
      maxtime: utils.getTs(new Date()),
    });
    // 
    var query = new AV.Query('Article');
    var room = AV.Object.createWithoutData('Room', getApp().globalData.room_now.room.objectId);

    // 查询当前登录用户加入的room
    query.equalTo('room', room);

    query.descending('createdAt');
    query.limit(pageSize);
    query.include('creater,room');
   
    query.lessThanOrEqualTo('createdAt', new Date());

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
        if (results.length > 0) {
          maxtime = utils.getTs(results[results.length - 1].createdAt);
          console.log('time ts', maxtime);
        }
         console.log('maxtime', maxtime);
         console.log('that.data.maxtime', that.data.maxtime);

        //更新界面
        that.setData({
          // 拼接数组
          list: results,
          isLoading: false,
          hasMore: maxtime < that.data.maxtime,
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


    if (!that.data.hasMore) {
      wx.showToast({
        title: '没有更多了',
        icon: 'fail',
        duration: 500
      })
      return;
    }


    that.setData({
      isLoading: true,
    });
    var query = new AV.Query('Article');
    var room = AV.Object.createWithoutData('Room', getApp().globalData.room_now.room.objectId);

    // 查询当前登录用户加入的room
    query.equalTo('room', room);

    query.descending('createdAt');
    query.limit(pageSize);
    query.include('creater,room');

    var oldest = new Date(that.data.maxtime);
    query.lessThanOrEqualTo('createdAt', oldest);

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
        if (results.length > 0) {
          maxtime = utils.getTs(results[results.length - 1].createdAt);
          console.log('time ts', maxtime);
        }
        console.log('maxtime', maxtime);
         console.log('that.data.maxtime', that.data.maxtime);
        //更新界面
        that.setData({
          // 拼接数组
          list: that.data.list.concat(results),
          hasMore: maxtime < that.data.maxtime,
          maxtime: maxtime,
          isLoading: false,
        })
      }
    });
  },



  checkLogin: function () {
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
        title: '当前班级：'+getApp().globalData.room_now.room.roomname,
      });

      that.refesh();
    }
  },
  //跳转到新建页面
  tapCreateArticle: function (e) {
    wx.navigateTo({
      url: '../createarticle/createarticle'
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src

    wx.previewImage({
      current: current,
      urls: [current]
    })
  }

})