const AV = require('../../utils/leancloud-storage');
const QN = require('../../utils/qiniuutil.js');
const Student = require('../../model/Student');
const Student2Room = require('../../model/Student2Room');
const Room = require('../../model/Room');
const utils = require('../../utils/util.js');
const Area = require('../../data/area.js');
const pageSize = 10;
Page({
  data: {
    // 是否显示loading
    showLoading: false,
    // loading提示语
    loadingMessage: '',
    // 提示消息
    toastMessage: '',
    student: null,
    jioned_room_map: {},
    list: [],
    maxtime: utils.getTs(new Date()),
    total: 0,
    hasMore: true,

    maskVisual: false,

    //地区数据
    provinces: Area.getData(),
    citys: [],
    dists: [],
    provinceIndex: -1,
    cityIndex: -1,
    distIndex: -1,

    //学校类型数据
    schooltypeIndex: 0,
    schooltypes: ['大学(专/本科/研究生/商学院)', '高中/中专', '初中', '小学', '幼儿园', '其他'],
    schooltypes_short: ['大学', '高中', '初中', '小学', '幼儿园', '其他'],

    where: {   //查询条件
      name: '',
      province: '',
      city: '',
      dist: '',
      entry_year: '',
      schooltype: ''
    }
  },
  onLoad: function (options) {
    console.log('onLoad', 'searchroom');
    // 页面初始化 options为页面跳转所带来的参数
    wx.hideNavigationBarLoading();
    this.setData({
      student: getApp().globalData.logined_student,
      jioned_room_map: getApp().globalData.jioned_room_map
    })
    this.refesh();

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    console.log('onShow', 'searchroom');
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
    this.refesh();
  },
  /**
   * 滚动到底部时加载下一页
   */
  bindscrolltolower: function () {
    console.log('到底部')
    this.loadMore();
  },
  //刷新处理
  refesh: function (e) {

    var that = this;

    that.showLoading('加载中');
    that.setData({
      maxtime: utils.getTs(new Date()),
    });


    //地区筛选
    var query = new AV.Query('Room');
    if (that.data.where.province)
      query.equalTo('province', that.data.where.province);
    if (that.data.where.city)
      query.equalTo('city', that.data.where.city);
    if (that.data.where.dist)
      query.equalTo('dist', that.data.where.dist);
    //学校类型筛选
    if (that.data.where.schooltype)
      query.equalTo('schooltype', that.data.schooltypes_short[that.data.schooltypeIndex]);
    //时间筛选
    if (that.data.where.entry_year) {
      var ts = Date.parse(that.data.where.entry_year);
      console.log(ts);
      query.lessThanOrEqualTo('entry_year', ts + 365 * 24 * 3600 * 1000);
      query.greaterThanOrEqualTo('entry_year', ts - 365 * 24 * 3600 * 1000);
    }
    //名称筛选
    if (that.data.where.name) {
      query.contains('name', that.data.where.name);
    }

    query.descending('createdAt');
    query.limit(pageSize);
    query.include('creater');
    // query.lessThanOrEqualTo('createdAt', new Date());

    // 执行查询
    query.find().then(function (results) {
      //嵌套的子对象，需要JSON.parse(JSON.stringify 重新赋值成json对象。

      if (results) {

        var maxtime = that.data.maxtime;
        if (results.length > 0) {

          results.forEach(function (scm, i, a) {
            scm.set('creater', JSON.parse(JSON.stringify(scm.get('creater'))));
            scm.set('yyyymmdd', utils.yyyymmdd(scm.get('createdAt')));
            scm.set('room', JSON.parse(JSON.stringify(scm)));
          });
          console.log('before JSON.parse', results);
          // //解析成json标准对象存储
          results = JSON.parse(JSON.stringify(results));
          console.log('after JSON.parse', results);

          maxtime = utils.getTs(results[results.length - 1].createdAt);
          console.log('time ts', maxtime);
        }
        console.log('maxtime', maxtime);
        console.log('that.data.maxtime', that.data.maxtime);

        //更新界面
        that.setData({
          // 拼接数组
          list: results,
          hasMore: maxtime < that.data.maxtime,
          maxtime: maxtime,
        })

      }
      that.hideLoading();
      wx.stopPullDownRefresh();
    });
  },


  //加载更多
  loadMore: function (e) {
    var that = this;
    if (!that.data.hasMore) {
      that.showToast('没有更多了');
      return;
    }

    that.showLoading('加载更多');

    //地区筛选
    var query = new AV.Query('Room');
    if (that.data.where.province)
      query.equalTo('province', that.data.where.province);
    if (that.data.where.city)
      query.equalTo('city', that.data.where.city);
    if (that.data.where.dist)
      query.equalTo('dist', that.data.where.dist);
    //学校类型筛选
    if (that.data.where.schooltype)
      query.equalTo('schooltype', that.data.where.schooltype);
    //时间筛选
    if (that.data.where.entry_year) {
      var ts = Date.parse(that.data.where.entry_year);
      console.log(ts);
      query.lessThanOrEqualTo('entry_year', ts + 365 * 24 * 3600 * 1000);
      query.greaterThanOrEqualTo('entry_year', ts - 365 * 24 * 3600 * 1000);
    }
    //名称筛选
    if (that.data.where.name) {
      query.contains('name', that.data.where.name);
    }

    query.descending('createdAt');
    query.limit(pageSize);
    query.include('creater');
    var oldest = new Date(that.data.maxtime);
    query.lessThanOrEqualTo('createdAt', oldest);

    // 执行查询
    query.find().then(function (results) {
      //嵌套的子对象，需要JSON.parse(JSON.stringify 重新赋值成json对象。

      if (results) {

        console.log('after JSON.parse', results);
        var maxtime = that.data.maxtime;
        if (results.length > 0) {

          results.forEach(function (scm, i, a) {
            scm.set('creater', JSON.parse(JSON.stringify(scm.get('creater'))));

          });
          console.log('before JSON.parse', results);
          // //解析成json标准对象存储
          results = JSON.parse(JSON.stringify(results));
          console.log('after JSON.parse', results);

          maxtime = utils.getTs(results[results.length - 1].createdAt);
          console.log('time ts', maxtime);
        }
        console.log('maxtime', maxtime);
        console.log('that.data.maxtime', that.data.maxtime);
        //更新界面
        that.setData({
          // 拼接数组
          list: that.data.list.concat(results),
          hasMore: maxtime < that.data.maxtime,
          maxtime: maxtime,
        })

      }
      that.hideLoading();
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

  searchRoom: function () {
    let that = this;
    that.refesh();

  },
  clearInput: function () {
    var where = this.data.where;
    where.name = '';
    this.setData({
      where: where
    });
  },
  inputTyping: function (e) {
    var where = this.data.where;
    where.name = e.detail.value;
    this.setData({
      where: where
    });
  },
  //跳转到加入页面
  tapJionRoom: function (e) {
    let that = this;
    let room = e.currentTarget.dataset.obj;

    if (this.data.jioned_room_map[room.objectId]) {
      this.showToast("您已经加入这个班级");
      that.enter2Room(e);
      return;
    }
    wx.navigateTo({
      url: '../jionroom/jionroom?isshare=false&name=' + room.name + '&objectId=' + room.objectId
      + '&question=' + room.question + '&answer=' + room.answer + '&picurl=' + room.picurl
    })
  },

 enter2Room: function (e) {
   let that = this;
    let room = e.currentTarget.dataset.obj;
    //改全局内存
    
    getApp().globalData.room_now = {
        room:room,
        student:that.data.student,
    }

    wx.navigateTo({
      url: '../blackboard/blackboard'
    })

  },

  bindDateChange: function (e) {

    var where = this.data.where;
    where.entry_year = e.detail.value;

    this.setData({
      where: where
    })

    this.searchRoom();
  },


  bindSchoolTypeChange: function (e) {

    const val = e.detail.value
    console.log('picker country code 发生选择改变，携带值为', val);
    // var that = this;
    // that.data.mIndex = e.currentTarget.dataset.index;
    // that.data.mArticle = that.data.list[that.data.mIndex];
    var where = this.data.where;
    where.schooltype = this.data.schooltypes[val];
    this.setData({
      where: where,
      schooltypeIndex: val,
    })

    this.searchRoom();

  },

  //地区选择控件
  cascadePopup: function (e) {
    console.log('cascadePopup');
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-in-out',
    });
    this.animation = animation;
    animation.translateY(-285).step();
    this.setData({
      animationData: this.animation.export(),
      maskVisual: true
    });
  },
  cascadeDismiss: function () {
    this.animation.translateY(285).step();
    this.setData({
      current: 0,
      animationData: this.animation.export(),
      maskVisual: false
    });
    this.searchRoom();
  },

  provinceTapped: function (e) {
    var index = e.currentTarget.dataset.index;
    var that = this;
    var where = that.data.where;
    where.province = that.data.provinces[index].areaName,
      where.city = '',
      where.dist = '',
      this.setData({
        provinceIndex: index,
        cityIndex: -1,
        citys: that.data.provinces[index].cities,
        dists: [],
        where: where,
      })
    this.setData({
      current: 1,
    })

  },
  cityTapped: function (e) {
    var index = e.currentTarget.dataset.index;
    var that = this;
    // load city
    var where = that.data.where;
    where.city = that.data.citys[index].areaName,
      where.dist = '',
      this.setData({
        cityIndex: index,
        distIndex: -1,
        dists: that.data.citys[index].counties,
        where: where,
      })
    this.setData({
      current: 2,
    })
  },

  distTapped: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var where = that.data.where;
    where.dist = that.data.dists[index].areaName,
      this.setData({
        distIndex: index,
        where: where,
      })
    this.cascadeDismiss();
  },

  clearTap: function (e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    var where = that.data.where;
    if (type == ('province')) {
      where.province = '';
      where.city = '';
      where.dist = '';
      this.setData({
        where: where,
        citys: [],
        dists: [],
        provinceIndex: -1,
        cityIndex: -1,
        distIndex: -1,
      })

    } else if (type == ('entry_year')) {
      where.entry_year = '';
    } else if (type == ('schooltype')) {
      where.schooltype = '';
    }
    this.setData({
      where: where,
    })
    that.searchRoom();
  },
})