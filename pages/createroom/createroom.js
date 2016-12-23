const AV = require('../../utils/leancloud-storage');
const QN = require('../../utils/qiniuutil.js');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');
const Area = require('../../data/area.js');

Page({
  data: {
    // 是否显示loading
    showLoading: false,
    // loading提示语
    loadingMessage: '',
    // 提示消息
    toastMessage: '',
    text: "Page createroom",
    tempFilePaths: [],
    disabled: true,
    date: "2005-09-01",
    areas: Area.getData(),
    selectedArea: {
      prov: "北京市",
      city: "北京市",
      dist: "东城区"
    },
    indexs: [0, 0, 0],
    isShowAreaPicker: false,
  },

  onLoad: function (options) {
    // // 页面初始化 options为页面跳转所带来的参数
    // var a=Area.getData();
    // console.log(a);
    // this.setData({
    //   areas:a
    // })
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
      that.showToast('请填写名称');
      return;
    }
    if (!desc) {
      that.showToast('请填写简介');
      return;
    }
    if (!desc) {
      that.showToast('请填写问题');
      return;
    }
    if (!desc) {
      that.showToast('请填写答案');
      return;
    }

    // 新建一个 AV 对象
    var room = new Room();
    room.set('name', name);
    room.set('desc', desc);
    room.set('picurl', that.data.tempFilePaths);
    room.set('province', that.data.selectedArea.prov);
    room.set('city', that.data.selectedArea.city);
    room.set('dist', that.data.selectedArea.dist);
    room.set('entry_year', that.data.date);
    room.set('question', '小贼贼是叫什么名字');
    room.set('answer', '张小山');
    room.set('teacher', '');
    var student = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);
    room.set('creater', student);

    room.save().then(function (room) {
      // 成功保存之后，执行其他逻辑.
      console.log('room created with id: ' + room.id);

      // console.log('av1', room);
      // console.log('av to json', room.toJSON());
      // var room2 = new Room(room.toJSON(), { parse: true })
      // console.log('av 2 ', room2);

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
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },


  bindProvChange: function (e) {
    const val = e.detail.value
    console.log('picker country code 发生选择改变，携带值为', e.detail.value);

    if (this.data.indexs[0] == val) {
      return;
    }
    this.data.indexs[0] = val;
    this.data.indexs[1] = 0;
    this.data.indexs[2] = 0;
    this.data.selectedArea.prov = this.data.areas[val].areaName;

    this.setData({
      selectedArea: this.data.selectedArea,
      indexs: this.data.indexs,
    })

  },
  bindCityChange: function (e) {
    const val = e.detail.value
    console.log('picker country code 发生选择改变，携带值为', e.detail.value);

    if (this.data.indexs[1] == val) {
      return;
    }
    this.data.indexs[1] = val;
    this.data.indexs[2] = 0;
    this.data.selectedArea.city = this.data.areas[this.data.indexs[0]].cities[val].areaName;

    this.setData({
      selectedArea: this.data.selectedArea,
      indexs: this.data.indexs,
    })
 

  },
  bindDistChange: function (e) {
    const val = e.detail.value
    console.log('picker country code 发生选择改变，携带值为', e.detail.value);

    if (this.data.indexs[2] == val) {
      return;
    }

    this.data.indexs[2] = val;
    this.data.selectedArea.dist = this.data.areas[this.data.indexs[0]].cities[this.data.indexs[1]].counties[val].areaName
    this.setData({
      selectedArea: this.data.selectedArea,
      indexs: this.data.indexs,
    })

   
  },
  showAreaPicker: function (index) {

    console.log('showAreaPicker', index);
    // var that = this;
    // that.data.mIndex = e.currentTarget.dataset.index;
    // that.data.mArticle = that.data.list[that.data.mIndex];

    this.setData({
      isShowAreaPicker: true
    });
  },

  hideAreaPicker: function () {

    this.setData({
      isShowAreaPicker: false
    });
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