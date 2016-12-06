const AV = require('../../utils/leancloud-storage.js');
const QN = require('../../utils/qiniuutil.js');

Page({
  data: {
    list: [],
    maxtime: '',
    total: 0,
    // size: 20,
    hasMore: true,
    isLoading: false
  },


  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
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
    that.setData({
      isLoading: true,
      list : []
    });

    var query = new AV.Query('Todo');
    query.limit(10);
    // 按时间，降序排列
    query.descending('createAt');
    query.find().then(

      function (results) {
        console.log('requestData succ ');
        that.setData({
          // 拼接数组
          list: results,
          isLoading: false,
          // total: res.data.info.count
        })
      },
      function (error) {
        console.log('requestData error ');
         that.setData({
          isLoading: false
        })
        wx.showToast({
          title: '查询失败',
          icon: 'fail',
          duration: 2000
        })
      });

    // wx.request({
    //   url: 'https://api.budejie.com/api/api_open.php',
    //   data: {
    //     a: 'list',
    //     c: 'data',
    //     // 上一页的maxtime作为加载下一页的条件，
    //     maxtime: this.data.maxtime,
    //     type: '10',
    //   },
    //   method: 'GET',
    //   success: function (res) {
    //     console.log(res)
    //     that.setData({
    //       // list: res.data.result.list,
    //       // page: 1,
    //       // isLoading: false,
    //       // 拼接数组
    //       list: res.data.list,
    //       isLoading: true,
    //       maxtime: res.data.info.maxtime,
    //       total: res.data.info.count,
    //     });
    //   }
    // })

  },


  //加载更多
  loadMore: function (e) {
    var that = this;
    that.setData({
      isLoading: true,
    });
    if (!this.data.hasMore) return
    var that = this;
    that.setData({
      isLoading: true,
    });
    wx.request({
      url: 'https://api.budejie.com/api/api_open.php',
      data: {
        a: 'list',
        c: 'data',
        type: '10',
      },
      method: 'GET',
      success: function (res) {
        console.log(res)
        that.setData({
          // list: res.data.result.list,
          // page: 1,
          // isLoading: false,
          // 拼接数组
          list: that.data.list.concat(res.data.list),
          maxtime: res.data.info.maxtime,
          total: res.data.info.count,
          isLoading: false
        });
      }
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
  }
})