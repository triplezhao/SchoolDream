const AV = require('../../utils/leancloud-storage');
const QN = require('../../utils/qiniuutil.js');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');

Page({
  data: {
    text: "Page jionclassroom",
    student: null,
    name: '',
    objectId: '',
    question: '',
    answer: '',
    picurl: '',
    isshare: false,

    nickname: '',
    input_answer: '',

    // 是否显示loading
    showLoading: false,
    // loading提示语
    loadingMessage: '',
    // 提示消息
    toastMessage: '',
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    let that = this;
    wx.hideNavigationBarLoading();
    wx.setNavigationBarTitle({title:'加入班级：'+options.name});
    this.setData({
      name: options.name,
      objectId: options.objectId,
      question: options.question,
      answer: options.answer,
      picurl: options.picurl,
      isshare: options.isshare,
    })
    that.relogin();
  },

  relogin: function () {
    //放到appjs里面加载不可以， app与page会同时加载
    this.showLoading('加载中');
    setTimeout(() => {
      this.hideLoading();
    }, 7000);
    getApp().checkLoginStatus((code, data) => {
      this.hideLoading();
          console.log('studentLogin', data);
      if (code == 1) {
        this.setData({
          student: data,
        });
      } else {
        // console.log('studentLogin', data);
      }
    });
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

  showLoading(loadingMessage) {
    this.setData({ showLoading: true, loadingMessage: loadingMessage ? loadingMessage : '加载中' });
  },

  // 隐藏loading提示
  hideLoading() {
    setTimeout(() => {
      this.setData({ showLoading: false, loadingMessage: '' });
    }, 200);
  },

  // 显示toast消息
  showToast(toastMessage) {
    wx.showToast({
      title: toastMessage,
      duration: 1000
    })
  },

  //跳转到加入页面
  tapJionRoom: function (e) {

    let that = this;
    if (!getApp().globalData.logined_student) {
      that.showLoading('加载中');
      getApp().checkLoginStatus((code, data) => {
        that.hideLoading();
        if (code == 1) {
          console.log('studentLogin', data);
        } else {
          //注册失败，直接返回。
          that.showToast('无法获取用户信息');
          return;
        }
      });
    };


    if (!that.data.nickname) {
      that.showToast('请填写本班昵称');
      return;
    }
    if (!that.data.input_answer) {
      that.showToast('请填写验证答案');
      return;
    }


    //先查询是否存在这个room
    var room = AV.Object.createWithoutData('Room', that.data.objectId);
    var query = new AV.Query('Room');
    query.equalTo('objectId', that.data.objectId);

    that.showLoading('正在加载');

    query.first().then(function (result) {
      console.log(result);
      //存在room，
      if (result) {

        //验证答案
        if (!that.checkAnswer()) {
          that.hideLoading();
          that.showToast('填写的答案不对，禁止加入')
          return;
        }

        console.log('check if  all ready jionin');
        //检查是否已经加入了

        var query1 = new AV.Query('Student2Room');
        query1.equalTo('room', room);

        var query2 = new AV.Query('Student2Room');
        var student = AV.Object.createWithoutData('Student', getApp().globalData.logined_student.objectId);
        query2.equalTo('student', student);

        var query = AV.Query.and(query1, query2);

        //create a new Student2Room
        var student2room = new AV.Object('Student2Room');
        student2room.set('nickname', that.data.nickname);
        student2room.set('student', student);
        student2room.set('room', room);

        query.first().then(function (results) {
          console.log(results);
          if (results == undefined) {

            console.log('go to create new student2room');
            student2room.save().then(function (data) {
              console.log('create new student2room succ');
              that.showToast('加入成功');
              that.hideLoading();
              getApp().globalData.refesh_change_home = true;
              if (that.data.isshare) {
                wx.redirectTo({
                  url: '/pages/home/home'
                })
              } else {
                wx.navigateBack();
              }

            });
          } else {
            console.log('do nothing');
            //重复加入错误
            that.showToast('您已经加入这个班级')
            that.hideLoading();
          }

        }, function (error) {
          console.log('error:', error);
          that.hideLoading();
        });

      } else {
        console.log('do nothing');
        //不存在此班级
        that.showToast('不存在此班级')
        that.hideLoading();
      }

    }, function (error) {
      console.log('error:', error);
      that.hideLoading();
    });


  },
  checkAnswer: function () {
    return this.data.input_answer == this.data.answer;
  },

  bindKeyInputNickname: function (e) {
    this.setData({
      nickname: e.detail.value
    })
  },
  bindKeyInputAnswer: function (e) {
    this.setData({
      input_answer: e.detail.value
    })
  },

})