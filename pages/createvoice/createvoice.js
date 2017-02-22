const AV = require('../../utils/leancloud-storage');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');
const Article = require('../../model/Article');
const utils = require('../../utils/util');
const config = require('../../config');
var playTimeInterval

Page({
  data: {
    textcount: 0,
    // 是否显示loading
    showLoading: false,
    // loading提示语
    loadingMessage: '',
    // 是否显示toast
    showToast: false,
    // 提示消息
    toastMessage: '',

    room_now: null,
    student: null,

    tempFilePathsPic: [],//图片的
    tempFilePathVoice: null,  //音频的
    disabled: true,


    recording: false,
    playing: false,
    hasRecord: false,
    recordTime: 0,
    playTime: 0,
    formatedRecordTime: '00:00:00',
    formatedPlayTime: '00:00:00'
  },

  onLoad: function (options) {
    let that = this;
    // 页面初始化 options为页面跳转所带来的参数
    that.setData({
      room_now: getApp().globalData.room_now,
      student: getApp().globalData.logined_student,
    })
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
    console.log('form发生了submit事件，携带数据为：', e.detail.value);

    var content = e.detail.value.content;
    var picurl = that.data.tempFilePathsPic;

    //如果不是当天或者，当前发送次数小于
    if (utils.isToday(getApp().globalData.logined_student.lastsendedtime) && getApp().globalData.logined_student.todaysended > config.onedaymax) {
      that.showToast('今天发布次数达到上限');
      return;
    }

    if (!content) {
      // that.showToast('内容不能为空');
      // return;
      content = '';
    }
    if (content.length > config.textmax) {
      that.showToast('内容不能超过'+textmax+'字');
      return;
    }
    if (!that.data.hasRecord) {
      that.showToast('还没有音频');
      return;
    }
    try {

      that.showLoading('加载中');

      console.log('that.data.tempFilePathVoice', that.data.tempFilePathVoice);
        //没图片的情况
        var voiceFile = new AV.File(that.data.tempFilePathVoice, {
          blob: {
            uri: that.data.tempFilePathVoice,
          }
        })
        var voiceurl = '';
        voiceFile.save()
          .then(res => {
            console.log(res);
            voiceurl = res.url();
            // 新建一个 AV 对象
            var article = new Article();
            article.set('title', 'title');
            article.set('content', content);
            article.set('voiceurl', voiceurl);
            that.save2Server(article);
          })
          .catch((error) => {
            console.log(error);
          });
      // }

    } catch (e) {
      that.hideLoading();
    }


  },


  save2Server: function (article) {

    var that = this;
    var creater = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);
    article.set('creater', creater);

    var room = AV.Object.createWithoutData('Room', getApp().globalData.room_now.room.objectId);
    article.set('room', room);

    article.save().then(function (res) {
      // 成功保存之后，执行其他逻辑.
      that.hideLoading();
      console.log('article created with objectId: ' + article.id);
      if (res) {
        that.showToast('发布成功');
        getApp().globalData.refesh_change_blackboard = true;
        wx.navigateBack();
        //触发动态更新通知
        getApp().sendtplsms_new_article();
        //更新24小时内的发送数
        getApp().updateUserSended();
      } else {
        // 异常处理
        console.error('发布失败: ' + error.message);
      }


    }, function (error) {
      // 异常处理
      that.hideLoading();
      console.error('Failed to create new object, with error message: ' + error.message);
    });
  },

  // 从相册选择照片或拍摄照片
  chooseImage() {
    var that = this;
    wx.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res);
        //拼接到本地
        // let arr=res.tempFilePaths.concat(that.data.tempFilePaths);
        let arr = that.data.tempFilePathsPic.concat(res.tempFilePaths);
        //截取前3个
        arr = arr.slice(-3); // 输出：1,2,3

        that.setData({
          tempFilePathsPic: arr,
          disabled: false
        })
      },
    });
  },
  previewImage: function (e) {
    var current = e.currentTarget.dataset.src

    if (!current) {
      wx.showToast({
        title: '图片异常',
        icon: 'success',
        duration: 1000
      })
      return;
    }

    wx.previewImage({
      current: current,
      urls: this.data.tempFilePathsPic
    })
  },

  // 一下是录音代码
   startRecord: function () {
    var that = this
    this.setData({ recording: true })

    var interval = setInterval(function () {
      that.data.recordTime += 1
      that.setData({
        formatedRecordTime: utils.formatTime(that.data.recordTime)
      })
    }, 1000)

    wx.startRecord({
      success: function (res) {
        // success 
        console.log('startRecord success');
        that.setData({
          hasRecord: true,
          tempFilePathVoice: res.tempFilePath,
          formatedPlayTime: utils.formatTime(that.data.playTime)
        })
      },
      fail: function () {
        // fail
        console.log('startRecord fail');
        that.showToast('录制失败');
      },
      complete: function () {
        // complete
        console.log('startRecord complete');
        that.setData({ recording: false })
        clearInterval(interval)
      }
    })
  },
  stopRecord: function () {
    let that = this;
    wx.stopRecord({
      success: function (res) {
        // success
        console.log('stopRecord success');
      },
      fail: function () {
        // fail
        console.log('stopRecord fail');
      },
      complete: function () {
        // complete
        console.log('stopRecord complete');
        that.setData({
          disabled: false
        })
      }
    })

  },
  playVoice: function () {
    var that = this
    playTimeInterval = setInterval(function () {
      that.data.playTime += 1
      that.setData({
        playing: true,
        formatedPlayTime: utils.formatTime(that.data.playTime)
      })
    }, 1000)
    wx.playVoice({
      filePath: that.data.tempFilePathVoice,
      success: function (res) {
        // success
        console.log('playVoice success');
        that.data.playTime = 0
        that.setData({
          playing: false,
          formatedPlayTime: utils.formatTime(that.data.playTime)
        })
      },
      fail: function () {
        // fail
        console.log('playVoice fail');
        that.showToast('playVoice失败');
      },
      complete: function () {
        // complete
        console.log('playVoice complete');
        clearInterval(playTimeInterval)
      }
    })

  },
  pauseVoice: function () {
    let that = this;
    wx.pauseVoice({
      success: function (res) {
        // success
        console.log('pauseVoice success');
      },
      fail: function () {
        // fail
        console.log('pauseVoice fail');
      },
      complete: function () {
        // complete
        console.log('pauseVoice complete');
        that.setData({
          playing: false
        })
        clearInterval(playTimeInterval)
      }
    })

  },
  stopVoice: function () {
    let that = this;
    wx.stopVoice({
      success: function (res) {
        // success
        console.log('stopVoice success');
      },
      fail: function () {
        // fail
        console.log('stopVoice fail');
      },
      complete: function () {
        // complete
        console.log('stopVoice complete');
        clearInterval(playTimeInterval)
        that.data.playTime = 0
        that.setData({
          playing: false,
          formatedPlayTime: utils.formatTime(this.data.playTime)
        })
      }
    })
  },
  clear: function () {
    var that = this;
    wx.stopVoice({
      success: function (res) {
        // success
        console.log('stopVoice success');
      },
      fail: function () {
        // fail
        console.log('stopVoice fail');
      },
      complete: function () {
        // complete
        console.log('stopVoice complete');
        that.data.recordTime = 0
        that.data.playTime = 0
        clearInterval(playTimeInterval)
        that.setData({
          playing: false,
          hasRecord: false,
          tempFilePathVoice: '',
          formatedRecordTime: utils.formatTime(0)
        })
      }
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
  bindKeyInput: function (e) {
    this.setData({
      textcount: e.detail.value.length
    });
  }
})
