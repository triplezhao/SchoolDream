const AV = require('../../utils/leancloud-storage.js');
const QN = require('../../utils/qiniuutil.js');
const utils = require('../../utils/util.js');

const pageSize = 5;

Page({
  data: {
    // 是否显示loading
    showLoading: false,
    // loading提示语
    loadingMessage: '',
    // 提示消息
    toastMessage: '',

    room_now: null,
    student: null,

    list: [],
    maxtime: utils.getTs(new Date()),
    total: 0,
    // size: 20,
    hasMore: true,

    temp_voice_path: '',

    current: {
      poster: 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000',
      name: '此时此刻',
      author: '许巍',
      src: 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E06DCBDC9AB7C49FD713D632D313AC4858BACB8DDD29067D3C601481D36E62053BF8DFEAF74C0A5CCFADD6471160CAF3E6A&fromtag=46',
    },
    audioAction: {
      method: 'pause'
    }
  },

  onLoad: function (options) {

    // //app房间为空，则提示错误信息
    // this.checkLogin();

    // 页面初始化 options为页面跳转所带来的参数
    // this.refesh();
    this.setData({
      room_now: getApp().globalData.room_now,
      student: getApp().globalData.logined_student,
    })


    this.refesh();
  },

  onReady: function () {
    // 页面渲染完成
    console.log("onReady");
    // this.onShow();
  },
  onShow: function () {

    wx.setNavigationBarTitle({
      title: '当前班级：' + getApp().globalData.room_now.room.roomname,
    });
    // 页面显示
    console.log("onShow");
    if (getApp().globalData.refesh_change_blackboard) {
      getApp().globalData.refesh_change_blackboard = false;
      this.refesh();
    }

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

    console.log('startrefesh===============');

    var that = this;

    that.showLoading('加载中');
    that.setData({
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
      that.hideLoading();
      wx.stopPullDownRefresh();
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
          hasMore: maxtime < that.data.maxtime,
          maxtime: maxtime,
        })
      
      }
    });
  },


  //加载更多
  loadMore: function (e) {
    var that = this;
    if (!that.data.hasMore) {
      that.showToast('没有更多了');
      return;
    }

    that.showLoading('加载更多');

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
      that.hideLoading();
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
        })

      }
    });
  },

  //跳转到新建页面
  tapCreateArticle: function (e) {
    wx.navigateTo({
      url: '../createarticle/createarticle'
    })
  },
  //跳转到新建页面
  tapCreateVoice: function (e) {
    wx.navigateTo({
      url: '../createvoice/createvoice'
    })
  },
  previewImage: function (e) {
    var current = e.currentTarget.dataset.src

    wx.previewImage({
      current: current,
      urls: [current]
    })
  },


  playVoiceUrl: function (e) {
    var voiceurl = e.currentTarget.dataset.voiceurl;
    var httpsurl = QN.genHttpsDownUrl(voiceurl);
    wx.downloadFile({
      url: httpsurl,
      type: 'audio',
      success: function (res) {
        console.log(res);
        wx.playVoice({
          filePath: res.tempFilePath
        })
      },
      fail(error) {
        console.log(error)
      },
      complete(res) {
        console.log(res)
      }
    })
  },
  // 显示loading提示
  showLoading(loadingMessage) {
    this.setData({ showLoading: true, loadingMessage });
  },

  // 隐藏loading提示
  hideLoading() {
    this.setData({ showLoading: false, loadingMessage: '' });
  },

  // 显示toast消息
  showToast(toastMessage) {
    wx.showToast({
      title:toastMessage,
      duration:1000
    })
  },

})