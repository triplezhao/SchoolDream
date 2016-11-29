Page({
  data: {
    list: [],
    pn: '0',
    rn: '20',
    totalNum: '0',
    tag1: '明星',
    loadingHidden: false
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    //加载最新
    this.requestData('newlist');
  },

  /**
   * 上拉刷新
   */
  onPullDownRefresh: function () {
    //加载最新
    this.requestData('newlist');
  },

  /**
   * 加载更多
   */
  onReachBottom: function () {
    // Do something when page reach bottom.
    this.requestData('list');
  },

  /**
   * 请求数据
   */
  requestData: function (a) {

    loadingHidden: false;
    var that = this;

    if (a == 'newlist') {
      that.data.pn = '0';
      that.data.list = [];
    }

    console.log('================' + that.data.pn)
    var that = this;
    wx.request({
      url: 'https://image.baidu.com/channel/listjson',
      data: {
        pn: (parseInt(that.data.pn) + 1),
        rn: that.data.rn,
        // 上一页的maxtime作为加载下一页的条件，
        tag1: that.data.tag1,
        },
      method: 'GET',
      success: function (res) {
        console.log(res)
        console.log('上一页', that.datalist)
        that.setData({
             // 拼接数组
            list: that.data.list.concat(res.data.data),
            totalNum: res.data.totalNum,
            pn: res.data.start_index,
            loadingHidden: true
        })

      }
    })

    // console.log('================' + that.data.pn)
    // fetch('https://image.baidu.com/channel/listjson' + '?pn=' + (parseInt(that.data.pn) + 1) + '&rn=' + that.data.rn + '&tag1=' + that.data.tag1)
    //   .then(function (response) {
    //     response.json().then(function (res) {
    //       that.setData({
    //         // 拼接数组
    //         list: that.data.list.concat(res.data),
    //         totalNum: res.totalNum,
    //         pn: res.start_index,
    //         loadingHidden: true
    //       })

    //     })
    //   })

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