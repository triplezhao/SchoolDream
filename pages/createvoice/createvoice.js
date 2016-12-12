var util = require('../../utils/util.js')
const AV = require('../../utils/leancloud-storage');
const QN = require('../../utils/qiniuutil.js');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');
const Article = require('../../model/Article');

var playTimeInterval

Page({
  data: {

    tempFilePaths: [],//图片的
    tempFilePath: null,  //音频的
    disabled: true,
    isloading: false,

    recording: false,
    playing: false,
    hasRecord: false,
    recordTime: 0,
    playTime: 0,
    formatedRecordTime: '00:00:00',
    formatedPlayTime: '00:00:00'
  },

  formSubmit: function (e) {
    var that = this;
    console.log('form发生了submit事件，携带数据为：', e.detail.value);

    var content = e.detail.value.content;
    var picurl = that.data.tempFilePaths;

    if (!content) {
      wx.showToast({
        title: '内容不能为空',
        icon: 'success',
        duration: 1000
      })
      return;
    }
    if (!that.data.hasRecord) {
      wx.showToast({
        title: '还没有音频',
        icon: 'success',
        duration: 1000
      })
      return;
    }

    that.setData({
      isloading: true
    })


console.log('that.data.tempFilePath', that.data.tempFilePath);
    //第一步，先上传音频
    var uptoken = QN.genUpToken();
    wx.uploadFile({
      url: 'https://up.qbox.me',
      filePath: that.data.tempFilePath,
      name: 'file',
      formData: {
        'key': that.data.tempFilePath.split('//')[1],
        'token': uptoken
      },
      success: function (res) {
        var data = JSON.parse(res.data);

        that.setData({
          tempFilePath: QN.getImageUrl(data.key),
        })

        console.log(that.data.tempFilePath);


    // 新建一个 AV 对象
        var article = new Article();
        article.set('title', 'title');
        article.set('content', content);
        article.set('pics', that.data.tempFilePaths);
        article.set('voiceurl', QN.getImageUrl(data.key));
        that.save2Server(article);

      },
      fail(error) {
        console.log(error)
      },
      complete(res) {
        console.log(res)
      }
    })

  },


  save2Server: function (article) {
   

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
        getApp().globalData.refesh_change_blackboard = true;
        wx.navigateBack();
      } else {
        // 异常处理
        console.error('发布失败: ' + error.message);
      }
      that.setData({
        isloading: false
      })

    }, function (error) {
      // 异常处理
      that.setData({
        isloading: false
      })
      console.error('Failed to create new object, with error message: ' + error.message);
    });
  },


  // 从相册选择照片或拍摄照片
  chooseImage() {
    wx.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],

      success: (res) => {

        var that = this;
        that.setData({
          disabled: true
        })

        var uptoken = QN.genUpToken();

        //用这个直接生成http://jsfiddle.net/gh/get/extjs/4.2/icattlecoder/jsfiddle/tree/master/uptoken
        // var uptoken = 'Vu7wSzNFhyn2JxdvZ4VExCslx7lWNQUqsyC6XqRV:k9vaLUvyo8I5fnEaGI0XOWlNwLE=:eyJzY29wZSI6ImNsb3VkeSIsImRlYWRsaW5lIjoxNDgwNDQ2ODgxfQ==';

        console.log(res)

        that.setData({
          isloading: true
        })
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
              tempFilePaths: [QN.getImageUrl(data.key)],
              disabled: false
            })
            that.update();

            that.setData({
              isloading: false
            })
            wx.showToast({
              title: data.key,
              icon: 'success',
              duration: 1000
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

  // 一下是录音代码
  startRecord: function () {
    this.setData({ recording: true })

    var that = this
    var interval = setInterval(function () {
      that.data.recordTime += 1
      that.setData({
        formatedRecordTime: util.formatTime(that.data.recordTime)
      })
    }, 1000)
    wx.startRecord({
      success: function (res) {
        that.setData({
          hasRecord: true,
          tempFilePath: res.tempFilePath,
          formatedPlayTime: util.formatTime(that.data.playTime)
        })
      },
      complete: function () {
        that.setData({ recording: false })
        clearInterval(interval)
      }
    })
  },
  stopRecord: function () {
    wx.stopRecord();
    this.setData({
      disabled: false
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
      filePath: this.data.tempFilePath,
      success: function () {
        clearInterval(playTimeInterval)
        that.data.playTime = 0
        that.setData({
          playing: false,
          formatedPlayTime: util.formatTime(that.data.playTime)
        })
      }
    })
  },
  pauseVoice: function () {
    clearInterval(playTimeInterval)
    wx.pauseVoice()
    this.setData({
      playing: false
    })
  },
  stopVoice: function () {
    clearInterval(playTimeInterval)
    this.data.playTime = 0
    this.setData({
      playing: false,
      formatedPlayTime: util.formatTime(this.data.playTime)
    })
    wx.stopVoice()
  },
  clear: function () {
    this.data.recordTime = 0
    this.data.playTime = 0
    clearInterval(playTimeInterval)
    wx.stopVoice()
    this.setData({
      playing: false,
      hasRecord: false,
      tempFilePath: '',
      formatedRecordTime: util.formatTime(0)
    })
  }

})
