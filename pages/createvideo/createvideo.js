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

    tempFilePath_video: '',  //音频的

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

    if (!content) {
      that.showToast('内容不能为空');
      return;
    }
    if (content.length>300) {
      that.showToast('内容不能超过300字');
      return;
    }
    if (!that.data.tempFilePath_video) {
      that.showToast('还没有添加视频');
      return;
    }

    that.showLoading('加载中');

    console.log('that.data.tempFilePath', that.data.tempFilePath_video);
    // //第一步，先上传音频
    // var uptoken = QN.genUpToken();
    // wx.uploadFile({
    //   url: QN.getUploadUrl(),
    //   filePath: that.data.tempFilePath_video,
    //   name: 'file',
    //   formData: {
    //     'key': that.data.tempFilePath_video.split('//')[1],
    //     'token': uptoken
    //   },
    //   success: function (res) {
    //     var data = JSON.parse(res.data);

    //     that.setData({
    //       tempFilePath_video: QN.getImageUrl(data.key),
    //     })

    //     console.log(that.data.tempFilePath_video);

    //     // 新建一个 AV 对象
    //     var article = new Article();
    //     article.set('title', 'title');
    //     article.set('content', content);
    //     // article.set('pics', that.data.tempFilePaths);
    //     // article.set('voiceurl', QN.getImageUrl(data.key));
    //     article.set('videourl', that.data.tempFilePath_video);

    //     that.save2Server(article);

    //   },
    //   fail(error) {
    //     console.log(error)
    //   },
    //   complete(res) {
    //     console.log(res)
    //     that.hideLoading();
    //   }
    // })

    var videofile = new AV.File(that.data.tempFilePath_video, {
      blob: {
        uri: that.data.tempFilePath_video,
      }
    })
    videofile.save()
      .then(res => {
        console.log(res);
        //第2步，先上传数据
        var article = new Article();
        article.set('title', 'title');
        article.set('content', content);
        // article.set('pics', that.data.tempFilePaths);
        // article.set('voiceurl', QN.getImageUrl(data.key));
        article.set('videourl', res.url());
        that.save2Server(article);
      })
      .catch((error) => {
        console.log(error);
        that.hideLoading();
      });

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
  chooseVideo() {
    let that = this;
    wx.chooseVideo({
      maxDuration: 30,
      sourceType: ['album', 'camera'], // album 从相册选视频，camera 使用相机拍摄
      // maxDuration: 60, // 拍摄视频最长拍摄时间，单位秒。最长支持60秒
      camera: ['front', 'back'],
      success: function (res) {
        // success
        that.setData({
          tempFilePath_video: res.tempFilePath,
        })
      },
      fail: function () {
        // fail
        console.log('chooseVideo fail');
      },
      complete: function () {
        // complete
        console.log('chooseVideo complete');
      }
    })

  },

  previewImage: function (e) {
    var current = e.target.dataset.src

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
      urls: this.data.tempFilePaths
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
