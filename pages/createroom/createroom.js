const AV = require('../../utils/leancloud-storage');
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

    areas: Area.getData(),
    selectedArea: {
      prov: "北京市",
      city: "北京市",
      dist: "东城区"
    },
    indexs: [0, 0, 0],

    questionIndex: 0,
    questions: ['咱班班主任叫什么名字？', '咱班班长叫什么名字？', '咱班换了几次英语老师=。=？'],

    schooltypeIndex: 0,
    schooltypes: ['大学(专/本科/研究生/商学院)', '高中/中专', '初中', '小学', '幼儿园', '其他'],
    schooltypes_short: ['大学', '高中', '初中', '小学', '幼儿园', '其他'],

    name: '',
    desc: '',
    question: '',
    answer: '',
    schooltype: '',
    date: "2005-09-01",
  },

  onLoad: function (options) {
    // // 页面初始化 options为页面跳转所带来的参数
    // var a=Area.getData();
    // console.log(a);
    this.setData({
      schooltype: this.data.schooltypes[0]
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
    console.log('form发生了submit事件，携带数据为：', e.detail.value)

    if (!that.check()) {
      return;
    }

    var picurls = that.data.tempFilePaths;
    //图片存储改用ld的avfile方式，其实也是七牛的。 不过不需要自己在七牛绑定https备案过的域名。
    that.showLoading();
    new AV.File(picurls[0], {
      blob: {
        uri: picurls[0],
      }
    }).save().then(res => {
      console.log(res);
      //第2步，先上传数据
      // 新建一个 AV 对象
      var room = new Room();
      room.set('name', that.data.name);
      room.set('desc', that.data.desc);
      room.set('picurl', [res.url()]);
      room.set('coverurl', res.url());
      room.set('province', that.data.selectedArea.prov);
      room.set('city', that.data.selectedArea.city);
      room.set('dist', that.data.selectedArea.dist);

      var ts = Date.parse(that.data.date + " 12:0:0");
      room.set('entry_year', ts);
      room.set('question', that.data.question);
      room.set('answer', that.data.answer);
      room.set('schooltype', that.data.schooltypes_short[that.data.schooltypeIndex]);
      room.set('teacher', '');
      var student = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);
      room.set('creater', student);

      return room.save();
    }).then(room => {
      that.hideLoading();
      console.log('room created with id: ' + room.id);
      that.showToast('创建成功')
      getApp().globalData.refesh_change_home = true;
      wx.navigateBack();
    })
      .catch((error) => {
        console.log(error);
        that.showToast('失败')
        that.hideLoading();
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
    this.data.selectedArea.city = this.data.areas[val].cities[0].areaName;
    this.data.selectedArea.dist = this.data.areas[val].cities[0].counties[0].areaName

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
    this.data.selectedArea.dist = this.data.areas[this.data.indexs[0]].cities[val].counties[0].areaName

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
  bindQuestionChange: function (e) {

    const val = e.detail.value
    console.log('picker country code 发生选择改变，携带值为', e.detail.value);
    // var that = this;
    // that.data.mIndex = e.currentTarget.dataset.index;
    // that.data.mArticle = that.data.list[that.data.mIndex];

    this.setData({
      question: this.data.questions[val],
      questionIndex: val,
    })
  },
  bindSchoolTypeChange: function (e) {

    const val = e.detail.value
    console.log('picker country code 发生选择改变，携带值为', e.detail.value);
    // var that = this;
    // that.data.mIndex = e.currentTarget.dataset.index;
    // that.data.mArticle = that.data.list[that.data.mIndex];

    this.setData({
      schooltype: this.data.schooltypes[val],
      schooltypeIndex: val,
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

  bindKeyInputName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindKeyInputDesc: function (e) {
    this.setData({
      desc: e.detail.value
    })
  },
  bindKeyInputQuestion: function (e) {
    this.setData({
      question: e.detail.value
    })
  },
  bindKeyInputAnswer: function (e) {
    this.setData({
      answer: e.detail.value
    })
  },

  check: function () {
    let that = this;
    if (!that.data.name) {
      that.showToast('请填写名称');
      return false;
    }
    if (that.data.name.length > 20) {
      that.showToast('名称不能超过20个字符');
      return false;
    }
    if (!that.data.desc) {
      that.showToast('请填写简介');
      return false;
    }
    if (that.data.desc.length > 100) {
      that.showToast('简介不能超过100个字符');
      return false;
    }
    if (!that.data.question) {
      that.showToast('请填写问题');
      return false;
    }
    if (that.data.question.length > 30) {
      that.showToast('问题不能超过30字符');
      return false;
    }
    if (!that.data.answer.length) {
      that.showToast('请填写答案');
      return false;
    }
    if (that.data.question.length > 30) {
      that.showToast('问题不能超过30字符');
      return false;
    }
    if (!that.data.tempFilePaths || that.data.tempFilePaths.length == 0) {
      that.showToast('请选择一张图片');
      return false;
    }
    return true;
  }
})