var detail = '../detail/detail'
Page({
  data: {
    list: [],
    maxtime: '',
    loadingHidden: false
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.requestData('newlist');
  },
  /*
  * 滚动到底部时加载下一页
  */
  bindscrolltolower: function () {
    console.log('到底部')
    this.requestData('list');

  },

  /**
   * 加载数据
   */
  requestData: function (a) {
    var that = this;
    wx.request({
      url: 'https://api.budejie.com/api/api_open.php',
      data: {
        a: a,
        c: 'data',
        // 上一页的maxtime作为加载下一页的条件，
        maxtime: this.data.maxtime,
        type: '31',
      },
      method: 'GET',
      success: function (res) {
        console.log(res)
        console.log('上一页', that.datalist)
        that.setData({
          // 拼接数组
          list: that.data.list.concat(res.data.list),
          loadingHidden: true,
          maxtime: res.data.info.maxtime
        })

      }
    })
    //  var that = this;
    // console.log('================' + that.data.maxtime)
    // fetch('https://api.budejie.com/api/api_open.php' + '?a=' + a + '&c=' + 'data' + '&maxtime=' + this.data.maxtime + '&type=' + 31)
    //   .then(function (response) {
    //     response.json().then(function (res) {
    //       console.log(res)
    //       that.setData({
    //         // 拼接数组
    //         list: that.data.list.concat(res.list),
    //         loadingHidden: true,
    //         maxtime: res.info.maxtime
          
    //       })

    //     })
    //   })
  },


  playVoice: function (e) {
    console.log(e);
    wx.playBackgroundAudio({
      dataUrl: e.currentTarget.dataset.voiceuri
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