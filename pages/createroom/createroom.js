const AV = require('../../utils/leancloud-storage');
const QN = require('../../utils/qiniuutil.js');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');

Page({
  data: {
    text: "Page createroom",
    tempFilePaths: [],
    disabled: true
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

    var name = e.detail.value.name;
    var desc = e.detail.value.desc;


    if (!name) {
      wx.showToast({
        title: 'name不能为空',
        icon: 'success',
        duration: 1000
      })
      return;
    }
    if (!desc) {
      wx.showToast({
        title: 'desc不能为空',
        icon: 'success',
        duration: 1000
      })
      return;
    }


    // 新建一个 AV 对象
    var room = new Room();
    room.set('roomname', name);
    room.set('desc', desc);
    room.set('picurl', that.data.tempFilePaths);
    room.set('province', '');
    room.set('city', '');
    room.set('dist', '');
    room.set('entryyear', '');
    var student = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);
    room.set('creater', student);



    room.save().then(function (room) {
      // 成功保存之后，执行其他逻辑.
      console.log('room created with objectId: ' + room.id);

      console.log('av1', room);
      console.log('av to json', room.toJSON());
      var room2 = new Room(room.toJSON(), { parse: true })
      console.log('av 2 ', room2);

      wx.showToast({
        title: '添加数据成功',
        icon: 'success',
        duration: 2000
      })

      getApp().globalData.refesh_change_home = true;
      wx.navigateBack();

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
          disabled: true
        })

        var uptoken = QN.genUpToken();

        //用这个直接生成http://jsfiddle.net/gh/get/extjs/4.2/icattlecoder/jsfiddle/tree/master/uptoken
        // var uptoken = 'Vu7wSzNFhyn2JxdvZ4VExCslx7lWNQUqsyC6XqRV:k9vaLUvyo8I5fnEaGI0XOWlNwLE=:eyJzY29wZSI6ImNsb3VkeSIsImRlYWRsaW5lIjoxNDgwNDQ2ODgxfQ==';

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
            var data = JSON.parse(res.data);

             that.setData({
              tempFilePaths: [QN.getImageUrl(data.key)],
              disabled: false
            })
            that.update();
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
  }


})