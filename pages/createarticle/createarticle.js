const AV = require('../../utils/leancloud-storage');
const QN = require('../../utils/qiniuutil.js');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');
const Article = require('../../model/Article');

Page({
  data: {
    text: "Page createarticle",
    tempFilePaths: ''
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
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
    console.log('form发生了submit事件，携带数据为：', e.detail.value)

    var content = e.detail.value.content;
    var picurl = that.data.tempFilePaths;

    // 新建一个 AV 对象
    var article = new Article();
    article.set('title', 'title');
    article.set('content', content);
    article.set('pics', that.data.tempFilePaths);

    var creater = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);
    article.set('creater', creater);

    var room = AV.Object.createWithoutData('Room', getApp().globalData.room_now.room.objectId);
    article.set('room', room);

    article.save().then(function (res) {
      // 成功保存之后，执行其他逻辑.
      console.log('article created with objectId: ' + article.id);
      if (res) {
        wx.showToast({
          title: '添加数据成功',
          icon: 'success',
          duration: 2000
        })
        wx.navigateBack();
      }else{
          // 异常处理
      console.error('发布失败: ' + error.message);
      }

    }, function (error) {
      // 异常处理
      console.error('Failed to create new object, with error message: ' + error.message);
    });
  },



  // 从相册选择照片或拍摄照片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],

      success: (res) => {

        var that = this;
        that.setData({
          tempFilePaths: res.tempFilePaths
        })

        var uptoken = QN.genUpToken();

        //用这个直接生成http://jsfiddle.net/gh/get/extjs/4.2/icattlecoder/jsfiddle/tree/master/uptoken
        // var uptoken = 'Vu7wSzNFhyn2JxdvZ4VExCslx7lWNQUqsyC6XqRV:k9vaLUvyo8I5fnEaGI0XOWlNwLE=:eyJzY29wZSI6ImNsb3VkeSIsImRlYWRsaW5lIjoxNDgwNDQ2ODgxfQ==';

        console.log(res)
        wx.uploadFile({

          url: 'https://up.qbox.me',
          filePath: res.tempFilePaths[0],
          name: 'file',
          formData: {
            'key': res.tempFilePaths[0].split('//')[1],
            'token': uptoken
          },
          success: function (res) {
            var data = JSON.parse(res.data);

            that.setData({
              tempFilePaths: [QN.getImageUrl(data.key)]
            })
            that.update();
            wx.showToast({
              title: data.key,
              icon: 'success',
              duration: 2000
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
    });
  },
  chooseImage2: function () {
    var that = this
    wx.chooseImage({

      success: function (res) {
        console.log(res)
        that.setData({
          imageList: res.tempFilePaths
        })
      }
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src

    wx.previewImage({
      current: current,
      urls: this.data.imageList
    })
  }

})