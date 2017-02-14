const AV = require('../../utils/leancloud-storage.js');
const utils = require('../../utils/util.js');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');
const Article = require('../../model/Article');
const Comment = require('../../model/Comment');
const Zan = require('../../model/Zan');
const Player = require('../../template/player/player');
const pageSize = 10;
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

    // //app房间为空，则提示错误信息
    // this.checkLogin();

    // 页面初始化 options为页面跳转所带来的参数
    // this.refesh();

    //如果是根据roomid进入的，则需要先拉取student2room对象
    // if(options.roomid){

    // }

    this.setData({
      room_now: getApp().globalData.room_now,
      student: getApp().globalData.logined_student,
    })


    Player.load(this);

    if (getApp().globalData.room_now) {
      this.refesh();
    }

  },

  onReady: function () {
    // 页面渲染完成
    console.log("onReady");
    // this.onShow();
  },
  onShow: function () {

    if (getApp().globalData.room_now) {
      wx.setNavigationBarTitle({
        title: '当前班级：' + getApp().globalData.room_now.room.name,
      });
      this.setData({
        room_now:getApp().globalData.room_now
      })
      // 页面显示
      console.log("onShow");
      if (getApp().globalData.refesh_change_blackboard) {
        getApp().globalData.refesh_change_blackboard = false;
        this.refesh();
      }

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
  onReachBottom: function () {
    console.log('到底部')
    this.loadMore();

  },

  //刷新处理
  refesh: function (e) {

    console.log('startrefesh===============');
    //获取房间所有学生和学生的昵称，组成一个对象，当做map<id:nickname>以便房间内显示昵称用
    var that = this;
    // 查询Student2Room
    var query = new AV.Query('Student2Room');
    var room = AV.Object.createWithoutData('Room', getApp().globalData.room_now.room.objectId);
    console.log('createWithoutData' + getApp().globalData.room_now.room.objectId);
    // 查询当前登录用户加入的room
    query.equalTo('room', room);
    query.include('student');

    that.showLoading('加载中');
    console.log('showLoading');
    // 执行查询
    query.find().then(function (student2Rooms) {
      //嵌套的子对象，需要JSON.parse(JSON.stringify 重新赋值成json对象。
      console.log('response', student2Rooms);
      if (student2Rooms) {
        student2Rooms.forEach(function (scm, i, a) {
          //组件
          scm.set('student', JSON.parse(JSON.stringify(scm.get('student'))));
          //结果必须转为jsonobj，不然获取不到scm.student
          scm = JSON.parse(JSON.stringify(scm));
          that.data.nicknamemap[scm.student.objectId] = scm;

        });
        console.log('nicknamemap', that.data.nicknamemap);

        //更新界面
        that.setData({
          nicknamemap: that.data.nicknamemap
        })

        //加载文章list
        that.refeshArticle();

      } else {
        console.log('student2Rooms' + student2Rooms);
        that.hideLoading('加载中');
      }
    }).catch(function (error) {
      console.log('error' + error);
      that.hideLoading('加载中');
    });
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
    var room = AV.Object.createWithoutData('Room', getApp().globalData.room_now.room.objectId);

    // 查询当前登录用户加入的room
    query.equalTo('room', room);

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
            scm.set('room', that.data.room_now.room);

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
    var room = AV.Object.createWithoutData('Room', getApp().globalData.room_now.room.objectId);

    // 查询当前登录用户加入的room
    query.equalTo('room', room);

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
             scm.set('room', that.data.room_now.room);


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

  tap_edit_user: function (e) {
    //去编辑页面，修改头像、修改昵称
    var current = e.currentTarget.dataset.src
    var itempics = e.currentTarget.dataset.itempics
    if (!itempics) itempics = [current];

    wx.previewImage({
      current: current,
      urls: itempics
    })
  },

  tap_edit_cover: function (e) {
    //可以统一到班级管理页面。 改班级封面，改昵称，改自己的头像。
    let that = this;

    //如果是管理员，则进入班级管理页面
    if (that.data.room_now.room.creater.objectId == that.data.student.objectId) {
      wx.navigateTo({
        url: '../roomsetting/roomsetting'
      })
    } else {
      var current = e.currentTarget.dataset.src
      var itempics = e.currentTarget.dataset.itempics
      if (!itempics) itempics = [current];
      wx.previewImage({
        current: current,
        urls: itempics
      })
    }

  },
    tap_setting: function (e) {
    //可以统一到班级管理页面。 改班级封面，改昵称，改自己的头像。
    let that = this;

    //如果是管理员，则进入班级管理页面
      wx.navigateTo({
        url: '../roomsetting/roomsetting'
      })

  },

  playVoiceUrl: function (e) {
    var voiceurl = e.currentTarget.dataset.voiceurl;
    var httpsurl = voiceurl;
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
  }
  ,
  showInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputShowed: false,
      isShowComment: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },


  showComment: function (index) {

    console.log('showComment', index);
    // var that = this;
    // that.data.mIndex = e.currentTarget.dataset.index;
    // that.data.mArticle = that.data.list[that.data.mIndex];

    this.setData({
      isShowComment: true
    });
  },

  hideComment: function () {

    this.setData({
      isShowComment: false
    });
  },

  //点击发送按钮，先隐藏键盘/评论框，再发送评论数据
  sendComment: function (e) {
    var that = this;
    this.hideComment();
    //从页面传过来的article
    var index = that.data.mIndex;
    var current_article = that.data.list[index];



    //赋值后 再删除数据
    var content = that.data.inputVal;
    this.hideInput();
    this.clearInput();


    //第2步，上传数据
    var comment = new Comment();
    comment.set('content', content);

    var creater = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);
    comment.set('creater', creater);

    //回复文章的作者，或者回复的评论作者
    var touser = AV.Object.createWithoutData('Student', current_article.creater.objectId);
    comment.set('touser', touser);

    var toarticle = AV.Object.createWithoutData('Article', current_article.objectId);
    comment.set('toarticle', toarticle);
    comment.fetchWhenSave(true);

    //回复的评论作者时候，才有这个值
    // var tocomment = AV.Object.createWithoutData('Comment',current_article.objectId);
    // comment.set('tocomment', tocomment);

    that.showLoading();

    comment.save()
      //保存评论
      .then(function (res) {



        var article1 = new Article(current_article, { parse: true });
        article1['danmulist'] = [];
        // //指针类的，需要转换成av对象指针。
        article1.set('creater', AV.Object.createWithoutData('Student', current_article.creater.objectId));
        article1.set('room', AV.Object.createWithoutData('Room', current_article.room.objectId));
        article1.increment('commentnum', 1);
        article1.add('comments', res);
        article1.fetchWhenSave(true); //这样，存储成功后，直接返回最新的数据
        // article1.include('creater,room,comments');

        return article1.save();
      })
      //保存文章，为文章添加评论数组，和评论数
      .then(function (res) {
        that.hideLoading();
        //替换列表中的当前文章。以便显示最新评论和评论数
        //json obj 没有set方法，直接用 .属性名= 的方式赋值
        that.data.list[index].comments = JSON.parse(JSON.stringify(res.get('comments')));
        that.data.list[index].commentnum = res.get('commentnum');
        let danmulist = [];
        that.data.list[index].comments.forEach(function (cmt, i, a) {
          danmulist[i] = {
            text: cmt.content,
            color: '#ff0000',
            time: i
          }
        });
        that.data.list[index].danmulist = JSON.parse(JSON.stringify(danmulist));
        that.setData({
          list: that.data.list,
        })

      }).catch(function (error) {
        that.hideLoading();
        // 异常处理
        that.showToast('发布失败');
        console.error('Failed to create new object, with error message: ' + error.message);
      });
  },

  //点击发送按钮，先隐藏键盘/评论框，再发送评论数据
  sendZan: function (e) {
    var that = this;
    //从页面传过来的article
    var index = that.data.mIndex;
    var current_article = that.data.list[index];

    //第2步，上传数据
    var zan = new Zan();
    var creater = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);
    zan.set('creater', creater);
    var article = AV.Object.createWithoutData('Article', current_article.objectId);
    zan.set('article', article);
    zan.fetchWhenSave(true);

    that.showLoading();
    zan.save()
      //保存评论
      .then(function (res) {
        // console.log('article1:======== ');
        var article1 = new Article(current_article, { parse: true });
        // console.log('article1:======== ', article1);
        // //指针类的，需要转换成av对象指针。
        article1.set('creater', AV.Object.createWithoutData('Student', current_article.creater.objectId));
        article1.set('room', AV.Object.createWithoutData('Room', current_article.room.objectId));
        article1.increment('zannum', 1);
        article1.add('zans', res);
        //  article1.addUnique('zans', res);
        // article1.fetchWhenSave(true); //这样，存储成功后，直接返回最新的数据
        // article1.include('creater,room,zans');

        return article1.save(null, {

          fetchWhenSave: true,
        });
      })
      //保存文章，为文章添加评论数组，和评论数
      .then(function (res) {
        that.hideLoading();
        //替换列表中的当前文章。以便显示最新评论和评论数
        //json obj 没有set方法，直接用 .属性名= 的方式赋值
        that.data.list[index].zans = JSON.parse(JSON.stringify(res.get('zans')));
        that.data.list[index].zannum = res.get('zannum');
        that.setData({
          list: that.data.list,
        })

      }).catch(function (error) {
        that.hideLoading();
        // 异常处理
        that.showToast('点赞失败');
        console.error('Failed to create new object, with error message: ' + error.message);
      });
  },
  //取消赞
  sendZanCancel: function (e) {
    var that = this;
    //从页面传过来的article
    var index = that.data.mIndex;
    var current_article = that.data.list[index];


    //第一步，查找到这个zan
    var thisZan = getContainsZan(that.data.mArticle.zans, getApp().globalData.logined_student);
    //第2步，新建一个赞的avzan
    var zan = AV.Object.createWithoutData('Zan', thisZan.objectId);

    that.showLoading();


    zan.destroy().then(function (success) {

      var article1 = new Article(current_article, { parse: true });

      // //指针类的，需要转换成av对象指针。
      article1.set('creater', AV.Object.createWithoutData('Student', current_article.creater.objectId));
      article1.set('room', AV.Object.createWithoutData('Room', current_article.room.objectId));
      article1.increment('zannum', -1);
      // article1.descending('zannum', 1);
      // article1.add('zans', res);
      // article1.remove('zans', zan);
      // article1.get('zans').remove(zan);
      article1.set('zans', removeZan(JSON.parse(JSON.stringify(article1.get('zans'))), success.id));
      article1.fetchWhenSave(true); //这样，存储成功后，直接返回最新的数据
      // article1.include('creater,room,zans');

      return article1.save();
    })
      //保存文章，为文章添加评论数组，和评论数
      .then(function (res) {
        that.hideLoading();
        //替换列表中的当前文章。以便显示最新评论和评论数
        //json obj 没有set方法，直接用 .属性名= 的方式赋值
        that.data.list[index].zans = JSON.parse(JSON.stringify(res.get('zans')));
        that.data.list[index].zannum = res.get('zannum');
        that.setData({
          list: that.data.list,
        })

      }).catch(function (error) {
        that.hideLoading();
        // 异常处理
        that.showToast('点赞失败');
        console.error('Failed to create new object, with error message: ' + error.message);
      });
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


  showActionSheet: function (e) {
    //从页面传过来的article
    console.log('showActionSheet', e);

    var that = this;
    that.data.mIndex = e.currentTarget.dataset.index;
    that.data.mArticle = that.data.list[that.data.mIndex];

    var index = e.currentTarget.dataset.index;

    console.log('点击了列表的：', index);

    var haszan = containsZan(that.data.mArticle.zans, getApp().globalData.logined_student);

    wx.showActionSheet({
      itemList: [haszan ? '取消赞' : '点赞', '评论'],
      // itemList: ['点赞', '评论'],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)
          switch (res.tapIndex) {
            case 0:
              if (haszan) {
                that.sendZanCancel(index);
              } else {
                that.sendZan(index);
              }

              break;
            case 1:
              that.showComment(index);
              break;
          }
        }
      },
    })
  },

  showActionSheetPlus: function (e) {
    //从页面传过来的article
    console.log('showActionSheet', e);
    var that = this;
    wx.showActionSheet({
      itemList: ['发图文', '发音频', '发视频'],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)
          switch (res.tapIndex) {
            case 0:
              wx.navigateTo({
                url: '../createarticle/createarticle'
              })
              break;
            case 1:
              wx.navigateTo({
                url: '../createvoice/createvoice'
              })
              break;
            case 2:
              wx.navigateTo({
                url: '../createvideo/createvideo'
              })
              break;
          }
        }
      },
    })
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
  //跳转到新建页面
  tapCreateVideo: function (e) {
    wx.navigateTo({
      url: '../createvideo/createvideo'
    })
  },
  playVoice: function (e) {
    Player.playVoice(this, e);
  },
  pauseVoice: function (e) {
    Player.pauseVoice(this, e);
  },
  stopVoice: function (e) {
    Player.stopVoice(this, e);
  },

  onShareAppMessage: function () {
    let that = this;
    let path = '/pages/jionroom/jionroom?isshare=true&name=' + getApp().globalData.room_now.room.name + '&objectId=' + getApp().globalData.room_now.room.objectId
      + '&question=' + getApp().globalData.room_now.room.question + '&answer=' + getApp().globalData.room_now.room.answer + '&picurl=' + getApp().globalData.room_now.room.picurl;
    console.log(path);
    return {
      title: getApp().globalData.room_now.room.name,
      desc: that.data.room_now.student.nickname + '喊你加入' + getApp().globalData.room_now.room.name,
      path: path
    }
  }

})

function containsZan(zans, student) {
  if (!zans) {
    return false;
  }
  if (zans.length <= 0) {
    return false;
  }
  var i = zans.length;
  while (i--) {
    if (zans[i].creater.objectId == student.objectId) {
      return true;
    }
  }
  return false;
}
function getContainsZan(zans, student) {
  if (!zans) {
    return false;
  }
  if (zans.length <= 0) {
    return false;
  }
  var i = zans.length;
  while (i--) {
    if (zans[i].creater.objectId == student.objectId) {
      return zans[i];
    }
  }
  return false;
}
function removeZan(zans, zanId) {
  if (!zans) {
    return false;
  }
  if (zans.length <= 0) {
    return false;
  }
  var i = zans.length;
  while (i--) {
    if (zans[i].objectId == zanId) {
      zans.splice(i, 1);
      return zans;
    }
  }
  return false;
}