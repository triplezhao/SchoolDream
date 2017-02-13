const AV = require('../../utils/leancloud-storage.js');
const QN = require('../../utils/qiniuutil.js');
const utils = require('../../utils/util.js');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');
const Article = require('../../model/Article');
const Comment = require('../../model/Comment');
const Zan = require('../../model/Zan');
const Player = require('../../template/player/player');
const pageSize = 100;
// import { Player } from '../../template/player/player';
Page({
  data: {

    inputShowed: false,
    isShowComment: false,
    inputVal: "",
    // 是否显示loading
    showLoading: false,
    // loading提示语
    loadingMessage: '',
    // 提示消息
    toastMessage: '',

    room_now: null,
    student: null,
    //本班所有同学的信息的map，key是objectId,value是room2student实体
    nicknamemap: {},
    voiceurlmap: {},

    list: [],
    maxtime: utils.getTs(new Date()),
    total: 0,
    // size: 20,
    hasMore: true,

    temp_voice_path: '',
    mArticle: {},
    mIndex: -1,

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

    // 管理员查看帖子列表
  

    this.setData({
      // room_now: getApp().globalData.room_now,
      student: getApp().globalData.logined_student,
    })


    Player.load(this);

    // if (getApp().globalData.room_now) {
      this.refeshArticle();
    // }

  },

  onReady: function () {
    // 页面渲染完成
    console.log("onReady");
    // this.onShow();
  },
  onShow: function () {




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
    this.refeshArticle();
  },
  /**
   * 滚动到底部时加载下一页
   */
  onReachBottom: function () {
    console.log('到底部')
    this.loadMore();

  },

 

  //刷新处理
  refeshArticle: function (e) {

    console.log('startrefesh===============');

    var that = this;

    that.showLoading('加载中');
    that.setData({
      maxtime: utils.getTs(new Date()),
    });
    // 
    var query = new AV.Query('Article');
    // var room = AV.Object.createWithoutData('Room', getApp().globalData.room_now.room.objectId);

    // 查询当前登录用户加入的room
    // query.equalTo('room', room);

    query.descending('createdAt');
    query.limit(pageSize);
    query.include('creater,comments,zans');
    // query.lessThanOrEqualTo('createdAt', new Date());

    // 执行查询
    query.find().then(function (results) {
      //嵌套的子对象，需要JSON.parse(JSON.stringify 重新赋值成json对象。

      if (results) {

        var maxtime = that.data.maxtime;
        if (results.length > 0) {

          results.forEach(function (scm, i, a) {
            scm.set('creater', JSON.parse(JSON.stringify(scm.get('creater'))));
            // scm.set('room', JSON.parse(JSON.stringify(scm.get('room'))));

            if (scm.get('comments')) {
              // scm.comments = JSON.parse(JSON.stringify(scm.get('comments')));
              scm.set('comments', JSON.parse(JSON.stringify(scm.get('comments'))));
              // console.log('comments', JSON.stringify(scm.get('comments')));
              let danmulist = [];
              scm.get('comments').forEach(function (cmt, i, a) {
                danmulist[i] = {
                  text: cmt.content,
                  color: '#ff0000',
                  time: i
                }
              });
              scm.set('danmulist', JSON.parse(JSON.stringify(danmulist)));
            }
            if (scm.get('zans')) {
              // scm.zans = JSON.parse(JSON.stringify(scm.get('zans')));
              scm.set('zans', JSON.parse(JSON.stringify(scm.get('zans'))));
            }
            // scm = JSON.parse(JSON.stringify(scm));

          });
          console.log('before JSON.parse', results);
          // //解析成json标准对象存储
          results = JSON.parse(JSON.stringify(results));
          console.log('after JSON.parse', results);

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
      that.hideLoading();
      wx.stopPullDownRefresh();
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
    // var room = AV.Object.createWithoutData('Room', getApp().globalData.room_now.room.objectId);

    // 查询当前登录用户加入的room
    // query.equalTo('room', room);

    query.descending('createdAt');
    query.limit(pageSize);
    query.include('creater,comments,zans');

    var oldest = new Date(that.data.maxtime);
    query.lessThanOrEqualTo('createdAt', oldest);

    // 执行查询
    query.find().then(function (results) {
      //嵌套的子对象，需要JSON.parse(JSON.stringify 重新赋值成json对象。

      if (results) {

        console.log('after JSON.parse', results);
        var maxtime = that.data.maxtime;
        if (results.length > 0) {
          results.forEach(function (scm, i, a) {
            scm.set('creater', JSON.parse(JSON.stringify(scm.get('creater'))));
            // scm.set('room', JSON.parse(JSON.stringify(scm.get('room'))));


            if (scm.get('comments')) {
              // scm.comments = JSON.parse(JSON.stringify(scm.get('comments')));
              scm.set('comments', JSON.parse(JSON.stringify(scm.get('comments'))));
              // console.log('comments', JSON.stringify(scm.get('comments')));
              let danmulist = [];
              scm.get('comments').forEach(function (cmt, i, a) {
                danmulist[i] = {
                  text: cmt.content,
                  color: '#ff0000',
                  time: i
                }
              });
              scm.set('danmulist', JSON.parse(JSON.stringify(danmulist)));
            }
            if (scm.get('zans')) {
              // scm.zans = JSON.parse(JSON.stringify(scm.get('zans')));
              scm.set('zans', JSON.parse(JSON.stringify(scm.get('zans'))));
            }
            // scm = JSON.parse(JSON.stringify(scm));
          });
          console.log('before JSON.parse', results);
          // //解析成json标准对象存储
          results = JSON.parse(JSON.stringify(results));
          console.log('after JSON.parse', results);

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
      that.hideLoading();
    });
  },


  previewImage: function (e) {
    var current = e.currentTarget.dataset.src
    var itempics = e.currentTarget.dataset.itempics
    if (!itempics) itempics = [current];

    wx.previewImage({
      current: current,
      urls: itempics
    })
  },



  playVoiceUrl: function (e) {
    var voiceurl = e.currentTarget.dataset.voiceurl;
    var httpsurl = QN.genHttpsDownUrl(voiceurl);
    wx.downloadFile({
      url: httpsurl,
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
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.setData({ showLoading: true, loadingMessage: loadingMessage ? loadingMessage : '加载中' });
  },

  // 隐藏loading提示
  hideLoading() {
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
    this.setData({ showLoading: false, loadingMessage: '' });
  },

  // 显示toast消息
  showToast(toastMessage) {
    wx.showToast({
      title: toastMessage,
      duration: 1000
    })
  },
   //点击发送按钮，先隐藏键盘/评论框，再发送评论数据
  delArticle: function (e) {
    var that = this;


    wx.showModal({
      title: '删除',
      content: '确认删除这条记录吗',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          //从页面传过来的article
          var index = e.currentTarget.dataset.index;
          var current_article = that.data.list[index];

          console.log('current_article', e);
          var article = AV.Object.createWithoutData('Article', current_article.objectId);

          that.showLoading();

          article.destroy().then((res) => {
            console.log('del succ ', res);
            that.data.list.splice(index, 1);
            that.setData({
              list: that.data.list,
            })
            that.hideLoading();
          }).catch((error) => {
            that.hideLoading();
            // 异常处理
            that.showToast('删除失败');
            console.error(error);
          });
        }
      }
    })

  },
  
});
 