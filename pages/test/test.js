// pages/leantest/test.js
const AV = require('../../utils/leancloud-storage.js');
const QN = require('../../utils/qiniuutil.js');

Page({

  data: {
    tempFilePaths: '',
    list: [],
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
    // this.requestData('list');
  },

  /**
   * 请求数据
   */
  requestData: function (a) {
    console.log('requestData start ');
    loadingHidden: false;
    var that = this;

    if (a == 'newlist') {
      that.data.list = [];
    }
    var query = new AV.Query('Todo');
    // 查询 priority 是 0 的 Todo
    // query.equalTo('priority', 0);
    // 按时间，降序排列
    query.descending('updatedAt');
    query.find().then(

      function (results) {
        console.log('requestData succ ');
        that.setData({
          // 拼接数组
          list: that.data.list.concat(results),
          loadingHidden: true
        })
      },
      function (error) {
        console.log('requestData error ');
        loadingHidden: true
        wx.showToast({
          title: '查询失败',
          icon: 'fail',
          duration: 2000
        })
      });

  },

  //添加数据
  addobj: function (title, content, url) {
    var that = this;
    console.log('add ');
    // 声明一个 Todo 类型
    var Todo = AV.Object.extend('Todo');
    // 新建一个 Todo 对象
    var todo = new Todo();
    todo.set('title', title);
    todo.set('content', content);
    todo.set('url', url);
    todo.save().then(function (todo) {
      // 成功保存之后，执行其他逻辑.
      console.log('New object created with objectId: ' + todo.id);

      //加载最新
      that.requestData('newlist');


      wx.showToast({
        title: '添加数据成功',
        icon: 'success',
        duration: 2000
      })
    }, function (error) {
      // 异常处理
      console.error('Failed to create new object, with error message: ' + error.message);
    });

  },
  //删除数据
  delobj: function (e) {
    var that = this;
    //帖子id 对应wxml中data-objectid="{{item.objectId}}"
    console.log(e.currentTarget.id)
    var objectId = e.currentTarget.dataset.objectid;
    console.log('del ');
    console.log(objectId);
    console.log('e ' + e);
    wx.showModal({
      title: '删除',
      content: '确定删除帖子？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          var todo = AV.Object.createWithoutData('Todo', objectId);
          todo.destroy().then(function (success) {

            //加载最新
            that.requestData('newlist');
            // 删除成功
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 2000
            })
          }, function (error) {
            // 删除失败
            wx.showToast({
              title: '删除失败',
              icon: 'fail',
              duration: 2000
            })
          });
        }
      }
    })

  },



  //跳转到首页
  tap2mian: function (e) {
    console.log('tap2mian ');
    var mainpage = '../word/word'
    wx.navigateTo({
      url: mainpage + '?' + 'url=' + 'xxx',
      success: function (res) {
        console.log(res)
      },
      fail: function (err) {
        console.log(err)
      },
    })
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
          tempFilePaths: res.tempFilePaths[0]
        })


      
         var uptoken = QN.genUpToken();

        //用这个直接生成http://jsfiddle.net/gh/get/extjs/4.2/icattlecoder/jsfiddle/tree/master/uptoken
        // var uptoken = 'Vu7wSzNFhyn2JxdvZ4VExCslx7lWNQUqsyC6XqRV:k9vaLUvyo8I5fnEaGI0XOWlNwLE=:eyJzY29wZSI6ImNsb3VkeSIsImRlYWRsaW5lIjoxNDgwNDQ2ODgxfQ==';

        console.log(res)
        wx.uploadFile({

          url: 'https://up.qbox.me',
          filePath: res.tempFilePaths[0],
          name: 'file',
          formData: {
            'key': res.tempFilePaths[0].split('//')[1],
            'token': uptoken
          },
          success: function (res) {
            var data = JSON.parse(res.data);

            that.setData({
              tempFilePaths: QN.getImageUrl(data.key)
            })
            wx.showToast({
              title: data.key,
              icon: 'success',
              duration: 2000
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

  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var that = this;
    that.addobj(e.detail.value.title, e.detail.value.content, that.data.tempFilePaths);
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