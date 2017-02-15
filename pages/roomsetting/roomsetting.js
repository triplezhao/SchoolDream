const AV = require('../../utils/leancloud-storage');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');

Page({
  data: {
    text: "Page wode",
    // 是否显示loading
    showLoading: false,
    // loading提示语
    loadingMessage: '',
    // 提示消息
    toastMessage: '',

    tempFilePaths: [],
    student: null,
    room_now: null,
    list: [],


    nickname: '',
    name: '',
    desc: '',
    question: '',
    answer: '',

  },
  onLoad: function (options) {
    if (!getApp().globalData.room_now)
      return;
    wx.hideNavigationBarLoading();
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    //改本业内存
    that.setData({
      room_now: getApp().globalData.room_now,
      student: getApp().globalData.logined_student,
      tempFilePaths: [getApp().globalData.room_now.room.coverurl]
    })
    wx.setNavigationBarTitle({
      title: '当前班级：' + getApp().globalData.room_now.room.name,
    });

    this.loadStudents();

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    if (!getApp().globalData.room_now)
      return;
    // 页面显示
    wx.setNavigationBarTitle({
      title: '当前班级：' + getApp().globalData.room_now.room.name,
    });
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  /**
    * 上拉刷新
    */
  onPullDownRefresh: function () {
    //加载最新
    this.loadStudents();
  },

  loadStudents: function () {
    var that = this;
    // 查询Student2Room
    var query = new AV.Query('Student2Room');
    var room = AV.Object.createWithoutData('Room', getApp().globalData.room_now.room.objectId);

    // 查询当前登录用户加入的room
    query.equalTo('room', room);
    query.include('student,room');
    // query.descending('createdAt');

    // 执行查询
    query.find().then(function (student2Rooms) {
      //嵌套的子对象，需要JSON.parse(JSON.stringify 重新赋值成json对象。
      if (student2Rooms) {
        student2Rooms.forEach(function (scm, i, a) {
          scm.set('student', JSON.parse(JSON.stringify(scm.get('student'))));
          scm.set('room', JSON.parse(JSON.stringify(scm.get('room'))));
          // scm=JSON.parse(JSON.stringify(scm));
        });
        console.log('before JSON.parse', student2Rooms);

        //解析成json标准对象存储
        student2Rooms = JSON.parse(JSON.stringify(student2Rooms));

        console.log('after JSON.parse', student2Rooms);

        //更新界面
        that.setData({
          list: student2Rooms,
          islogin: true,
        })
      }
    }, function (error) {
      console.log(error);
    });
  },
  //跳转到加入页面
  tapInvite: function () {
    // var that = this;
    // wx.navigateTo({
    //   url: '../invite/invite?invitecode=' + getApp().globalData.room_now.room.objectId
    // })
    this.showToast('点击右上角的分享，将本班级发送给同学');

  },


  //退出班级
  tapOutRoom: function (e) {
    var that = this;
    wx.showModal({
      title: '退出班级',
      content: '确认退出班级吗',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var student2Room = AV.Object.createWithoutData('Student2Room', that.data.room_now.objectId);
          student2Room.destroy().then(function (success) {
            console.log(success);
            // 删除成功,云函数会处理 关联的删除操作
            getApp().globalData.refesh_change_home = true;

            // //更新班级人数
            var room = AV.Object.createWithoutData('Room', that.data.room_now.room.objectId);
            room.increment('usercount', -1);
            room.save().then(function (res) {
              // 成功
              console.log('usercount ' + res);
              getApp().globalData.refesh_change_home = true;
              getApp().globalData.jioned_room_map = {};

              // wx.navigateBack();
              // wx.redirectTo({
              //   url: '../home/home'
              // })
              wx.navigateBack({
                delta: 10
              })
            }, function (error) {
              // 异常处理
              console.log('error ', error);
            });


          }, function (error) {
            // 删除失败
            console.log(error);
          });
        }
      }
    })


  },
  //解散房间
  tapDelRoom: function (e) {
    var that = this;
    wx.showModal({
      title: '删除班级',
      content: '删除班级，班级相册等内容会一并删除',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var room = AV.Object.createWithoutData('Room', that.data.room_now.room.objectId);
          room.destroy().then(function (success) {
            console.log(success);
            // 删除成功,云函数会处理 关联的删除操作
            getApp().globalData.refesh_change_home = true;
            getApp().globalData.jioned_room_map = {};
            // wx.redirectTo({
            //   url: '../home/home'
            // })
            wx.navigateBack({
              delta: 10
            })

          }, function (error) {
            // 删除失败
            console.log(error);
          });
        }
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



  // 从相册选择照片或拍摄照片
  chooseImage() {
    var that = this;
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
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
      urls: [current]
    })
  },


  //保存昵称
  tapUpdateCover: function (e) {
    let that = this;
    if (!that.data.tempFilePaths || that.data.tempFilePaths.length == 0 || that.data.tempFilePaths[0] == getApp().globalData.room_now.room.coverurl) {
      that.showToast('请先选择图片');
      return false;
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
      var that = this;
      var room = AV.Object.createWithoutData('Room', that.data.room_now.room.objectId);
      // 保存到云端

      room.set('coverurl', res.url());
      room.fetchWhenSave(true);

      return room.save();
    }).then(resroom => {

      // res.set('student', JSON.parse(JSON.stringify(scm.get('student'))));
      that.data.room_now.room.coverurl = resroom.get("coverurl");
      // getApp().globalData.jioned_room_map[room.objectId] = scm;
      getApp().globalData.room_now = that.data.room_now;
      that.setData({
        room_now: that.data.room_now,
        tempFilePaths: [getApp().globalData.room_now.room.coverurl]
      })
      that.hideLoading();
      that.showToast("保存成功");

    })
      .catch((error) => {
        console.log(error);
        that.hideLoading();
        that.showToast('失败')
      });
  },
  tapUpdateNickname: function (e) {
    var that = this;
    var student2Room = AV.Object.createWithoutData('Student2Room', that.data.room_now.objectId);
    // 修改属性
    student2Room.set('nickname', that.data.nickname);
    // 保存到云端
    that.showLoading();
    student2Room.fetchWhenSave(true);
    student2Room.save().then(function (res) {
      // res.set('student', JSON.parse(JSON.stringify(scm.get('student'))));
      that.data.room_now.nickname = res.get("nickname");
      // getApp().globalData.jioned_room_map[room.objectId] = scm;
      getApp().globalData.room_now = that.data.room_now;
      that.setData({
        room_now: that.data.room_now
      })
      that.hideLoading();
      that.showToast("保存成功");
    }).catch(function (error) {
      that.hideLoading();
    });

  },
  //保存班级名称
  tapUpdateName: function (e) {
    var that = this;
    var room = AV.Object.createWithoutData('Room', that.data.room_now.room.objectId);
    // 修改属性
    room.set('name', that.data.name);
    // 保存到云端
    that.showLoading();
    room.fetchWhenSave(true);
    room.save().then(function (res) {
      // res.set('student', JSON.parse(JSON.stringify(scm.get('student'))));
      that.data.room_now.room.name = res.get("name");
      // getApp().globalData.jioned_room_map[room.objectId] = scm;
      getApp().globalData.room_now = that.data.room_now;
      that.setData({
        room_now: that.data.room_now
      })
      that.hideLoading();
      that.showToast("保存成功");
    }).catch(function (error) {
      that.hideLoading();
    });

  },

  // nickname: '',
  //   name: '',
  //   desc: '',
  //   question: '',
  //   answer: '',
  //保存班级描述
  tapUpdateDesc: function (e) {
    var that = this;
    var room = AV.Object.createWithoutData('Room', that.data.room_now.room.objectId);
    // 修改属性
    room.set('desc', that.data.desc);
    // 保存到云端
    that.showLoading();
    room.fetchWhenSave(true);
    room.save().then(function (res) {
      // res.set('student', JSON.parse(JSON.stringify(scm.get('student'))));
      that.data.room_now.room.desc = res.get("desc");
      // getApp().globalData.jioned_room_map[room.objectId] = scm;
      getApp().globalData.room_now = that.data.room_now;
      that.setData({
        room_now: that.data.room_now
      })
      that.hideLoading();
      that.showToast("保存成功");
    }).catch(function (error) {
      that.hideLoading();
    });

  },
  // nickname: '',
  //   name: '',
  //   desc: '',
  //   question: '',
  //   answer: '',
  //保存班级描述
  tapUpdateQuestion: function (e) {
    var that = this;
    var room = AV.Object.createWithoutData('Room', that.data.room_now.room.objectId);
    // 修改属性
    room.set('question', that.data.question);
    // 保存到云端
    that.showLoading();
    room.fetchWhenSave(true);
    room.save().then(function (res) {
      // res.set('student', JSON.parse(JSON.stringify(scm.get('student'))));
      that.data.room_now.room.question = res.get("question");
      // getApp().globalData.jioned_room_map[room.objectId] = scm;
      getApp().globalData.room_now = that.data.room_now;
      that.setData({
        room_now: that.data.room_now
      })
      that.hideLoading();
      that.showToast("保存成功");
    }).catch(function (error) {
      that.hideLoading();
    });

  },
  // nickname: '',
  //   name: '',
  //   desc: '',
  //   question: '',
  //   answer: '',
  //保存班级描述
  tapUpdateAnswer: function (e) {
    var that = this;
    var room = AV.Object.createWithoutData('Room', that.data.room_now.room.objectId);
    // 修改属性
    room.set('answer', that.data.answer);
    // 保存到云端
    that.showLoading();
    room.fetchWhenSave(true);
    room.save().then(function (res) {
      // res.set('student', JSON.parse(JSON.stringify(scm.get('student'))));
      that.data.room_now.room.answer = res.get("answer");
      // getApp().globalData.jioned_room_map[room.objectId] = scm;
      getApp().globalData.room_now = that.data.room_now;
      that.setData({
        room_now: that.data.room_now
      })
      that.hideLoading();
      that.showToast("保存成功");
    }).catch(function (error) {
      that.hideLoading();
    });

  },
  bindKeyInputNickname: function (e) {
    this.setData({
      nickname: e.detail.value
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

  onShareAppMessage: function () {
    let that = this;
    let path = '/pages/jionroom/jionroom?isshare=true&name=' + getApp().globalData.room_now.room.name + '&objectId=' + getApp().globalData.room_now.room.objectId
      + '&question=' + getApp().globalData.room_now.room.question + '&answer=' + getApp().globalData.room_now.room.answer + '&picurl=' + getApp().globalData.room_now.room.picurl;
    console.log(path);
    return {
      title: that.data.room_now.student.nickname + '喊你加入' + getApp().globalData.room_now.room.name,
      desc: that.data.room_now.student.nickname + '喊你加入' + getApp().globalData.room_now.room.name,
      path: path
    }
  }

})