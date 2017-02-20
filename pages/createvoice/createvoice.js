var util = require('../../utils/util.js')
const AV = require('../../utils/leancloud-storage');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');
const Article = require('../../model/Article');

var playTimeInterval

Page({
  data: {

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

    if (!content) {
      that.showToast('内容不能为空');
      return;
    }
    if (content.length>300) {
      that.showToast('内容不能超过300字');
      return;
    }
    if (!that.data.hasRecord) {
      that.showToast('还没有音频');
      return;
    }
    try {

      that.showLoading('加载中');

      console.log('that.data.tempFilePathVoice', that.data.tempFilePathVoice);

      //图片存储改用ld的avfile方式，其实也是七牛的。 不过不需要自己在七牛绑定https备案过的域名。
      if (that.data.tempFilePathsPic.length > 0) {

        let picPaths = that.data.tempFilePathsPic;
        let fileUrls = [];
        // for (let i = 0; i < picPaths.length; i++) {

        let picfile = new AV.File(picPaths[0], {
          blob: {
            uri: picPaths[0],
          }
        })
        picfile.save()
          .then(res => {
            console.log(res);
            fileUrls[0] = res.url();

            //如果大于1张，则继续去保存第二张
            if (1 < picPaths.length) {
              //第2步，先上传数据
              let picfile = new AV.File(picPaths[1], {
                blob: {
                  uri: picPaths[1],
                }
              })
              return picfile.save();
            }
          }).then(res => {
            if (res) {
              console.log(res);
              fileUrls[1] = res.url();
            }
            //如果大于2张，则继续save
            if (2 < picPaths.length) {
              let picfile = new AV.File(picPaths[2], {
                blob: {
                  uri: picPaths[2],
                }
              })
              return picfile.save();
            }
          }).then(res => {
            //如果是3张，则取值
            if (res) {
              console.log(res);
              fileUrls[2] = res.url();
            }
            //第2步，上传音频
            var voiceFile = new AV.File(that.data.tempFilePathVoice, {
              blob: {
                uri: that.data.tempFilePathVoice,
              }
            })
            return voiceFile.save();
          }).then(res => {
            console.log(res);
            var voiceurl = res.url();
            // 新建一个 AV 对象
            var article = new Article();
            article.set('title', 'title');
            article.set('content', content);
            article.set('pics', fileUrls);
            article.set('voiceurl', voiceurl);
            that.save2Server(article);
          })
          .catch((error) => {
            console.log(error);
            that.hideLoading();
          });


        // for (let i = 0; i < picPaths.length; i++) {

        //   let picfile = new AV.File(picPaths[i], {
        //     blob: {
        //       uri: picPaths[i],
        //     }
        //   })
        //   picfile.save()
        //     .then(res => {
        //       console.log(res);
        //       fileUrls[i] = res.url();

        //       //最后一张上传完成，则提交表单
        //       if (i == picPaths.length - 1) {
        //         //第2步，先上传音频
        //         var voiceFile = new AV.File(that.data.tempFilePathVoice, {
        //           blob: {
        //             uri: that.data.tempFilePathVoice,
        //           }
        //         })
        //         var voiceurl = '';
        //         voiceFile.save().then(res => {
        //           console.log(res);
        //           voiceurl = res.url();
        //           // 新建一个 AV 对象
        //           var article = new Article();
        //           article.set('title', 'title');
        //           article.set('content', content);
        //           article.set('pics', fileUrls);
        //           article.set('voiceurl', voiceurl);
        //           that.save2Server(article);
        //         });
        //       }

        //     })
        //     .catch((error) => {
        //       console.log(error);
        //       that.hideLoading();
        //     });
        // };

      } else {
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
      }

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
         getApp().sendtplsms_new_article();
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
        formatedRecordTime: util.formatTime(that.data.recordTime)
      })
    }, 1000)

    wx.startRecord({
      success: function (res) {
        // success 
        console.log('startRecord success');
        that.setData({
          hasRecord: true,
          tempFilePathVoice: res.tempFilePath,
          formatedPlayTime: util.formatTime(that.data.playTime)
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
        formatedPlayTime: util.formatTime(that.data.playTime)
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
          formatedPlayTime: util.formatTime(that.data.playTime)
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
          formatedPlayTime: util.formatTime(this.data.playTime)
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
          formatedRecordTime: util.formatTime(0)
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
})
