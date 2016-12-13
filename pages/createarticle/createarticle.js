const AV = require('../../utils/leancloud-storage');
const QN = require('../../utils/qiniuutil.js');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');
const Article = require('../../model/Article');

Page({
  data: {
    text: "Page createarticle",
    tempFilePaths: [],
    disabled: true,

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
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
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
    var picurl = that.data.tempFilePaths;

    if (!content) {
      that.showToast('内容不能为空');
      return;
    }
    if (!picurl) {
      that.showToast('图片不能为空');
      return;
    }

    that.showLoading('正在发布');
    //禁用发布按钮
    that.setData({
      disabled: true
    })

    //第一步，先上传图片
    var uptoken = QN.genUpToken();
    console.log(res)
    wx.uploadFile({
      url: QN.getUploadUrl(),
      filePath: res.tempFilePaths[0],
      name: 'file',
      formData: {
        'key': res.tempFilePaths[0].split('//')[1],
        'token': uptoken
      },
      success: function (res) {

        console.log(QN.getImageUrl(data.key));
        var data = JSON.parse(res.data);
        that.setData({
          tempFilePaths: [QN.getImageUrl(data.key)],
          disabled: false
        })

        //第2步，先上传数据
        var article = new Article();
        article.set('title', 'title');
        article.set('content', content);
        article.set('pics', [QN.getImageUrl(data.key)]);
        that.save2Server(article);

      },
      fail(error) {
        console.log(error)
        that.hideLoading();
      },
      complete(res) {
        console.log(res)
      }
    })


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
        console.error('发布失败');
        that.showToast('发布失败');
      }

    }, function (error) {
      that.hideLoading();
      // 异常处理
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
        that.setData({
          tempFilePaths: res.tempFilePaths,
          disabled: false
        })
      },
    });
  },
  // chooseImage2: function () {
  //   var that = this
  //   wx.chooseImage({

  //     success: function (res) {
  //       console.log(res)
  //       that.setData({
  //         imageList: res.tempFilePaths
  //       })
  //     }
  //   })
  // },
  previewImage: function (e) {
    var current = e.target.dataset.src

    if (!current) {
      this.showToast('图片异常');
      return;
    }

    wx.previewImage({
      current: current,
      urls: this.data.tempFilePaths
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
      title: toastMessage,
      duration: 1000
    })
  },
})