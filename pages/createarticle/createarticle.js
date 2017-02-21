const AV = require('../../utils/leancloud-storage');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');
const Article = require('../../model/Article');
const utils = require('../../utils/util');
const config = require('../../config');

Page({
  data: {
    textcount: 0,
    text: "Page createarticle",
    tempFilePaths: [],
    disabled: false,

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
    var picPaths = that.data.tempFilePaths;

    //如果不是当天或者，当前发送次数小于
    if (utils.isToday(getApp().globalData.logined_student.lastsendedtime)&&getApp().globalData.logined_student.todaysended>config.onedaymax) {
      that.showToast('今天发布次数达到上限');
      return;
    }

    if (!content) {
      that.showToast('内容不能为空');
      return;
    }
    if (content.length > config.textmax) {
      that.showToast('内容不能超过'+textmax+'字');
      return;
    }
    // if (!picPaths) {
    //   that.showToast('图片不能为空');
    //   return;
    // }

    that.showLoading('正在发布');
    //禁用发布按钮
    that.setData({
      disabled: false
    })

    //  picPaths.forEach(function(element,i) {

    //       console.log(element,i);

    //     }, this);

    //图片存储改用ld的avfile方式，其实也是七牛的。 不过不需要自己在七牛绑定https备案过的域名。


    let fileUrls = [];
    if (!picPaths || picPaths.length == 0) {
      //如果没有值
      let article = new Article();
      article.set('title', 'title');
      article.set('content', content);
      article.set('pics', fileUrls);
      that.save2Server(article);
    } else {
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
          //如果没有值
          let article = new Article();
          article.set('title', 'title');
          article.set('content', content);
          article.set('pics', fileUrls);
          that.save2Server(article);
        })
        .catch((error) => {
          console.log(error);
          that.hideLoading();
        });
    }


    // };



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

        //触发动态更新通知
        getApp().sendtplsms_new_article();
        //更新24小时内的发送数
        getApp().updateUserSended();
       

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
        //拼接到本地
        // let arr=res.tempFilePaths.concat(that.data.tempFilePaths);
        let arr = that.data.tempFilePaths.concat(res.tempFilePaths);
        //截取前3个
        arr = arr.slice(-3); // 输出：1,2,3

        that.setData({
          tempFilePaths: arr,
          // disabled: false
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
    var current = e.currentTarget.dataset.src

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
   bindKeyInput: function (e) {
    this.setData({
      textcount: e.detail.value.length
    });
  }
})