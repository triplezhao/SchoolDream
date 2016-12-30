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
    var picurls = that.data.tempFilePaths;

    if (!content) {
      that.showToast('内容不能为空');
      return;
    }
    if (!picurls) {
      that.showToast('图片不能为空');
      return;
    }

    that.showLoading('正在发布');
    //禁用发布按钮
    that.setData({
      disabled: true
    })

//  picurls.forEach(function(element,i) {

//       console.log(element,i);

//     }, this);

    //图片存储改用ld的avfile方式，其实也是七牛的。 不过不需要自己在七牛绑定https备案过的域名。

    new AV.File(picurls[0], {
      blob: {
        uri: picurls[0],
      }
    }).save().then(res => {
      console.log(res);
      //第2步，先上传数据
      var article = new Article();
      article.set('title', 'title');
      article.set('content', content);
      article.set('pics', [res.url()]);
      that.save2Server(article);
    })
      .catch((error) => {
        console.log(error);
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
      console.log('article created with objectId: ' + res.id);
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