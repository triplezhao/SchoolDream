const AV = require('../../utils/leancloud-storage');
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
    this.requestData('newlist').then(wx.stopPullDownRefresh);;
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
    // loadingHidden: false;
    var that = this;

    if (a == 'newlist') {
      that.data.list = [];
    }
    var query = new AV.Query('Todo');
    query.limit(10);
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
        // loadingHidden: true
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
  //添加3ge数据
  addfolder: function (title, content, url) {
    var that = this;
    // console.log('add ');
    // // 声明一个 Todo 类型
    // var Todo = AV.Object.extend('Todo');
    // // 新建一个 Todo 对象
    // var todo = new Todo();
    // todo.set('title', title);
    // todo.set('content', content);
    // todo.set('url', url);
    // todo.save().then(function (todo) {
    //   // 成功保存之后，执行其他逻辑.
    //   console.log('New object created with objectId: ' + todo.id);

    //   //加载最新
    //   that.requestData('newlist');


    //   wx.showToast({
    //     title: '添加数据成功',
    //     icon: 'success',
    //     duration: 2000
    //   })
    // }, function (error) {
    //   // 异常处理
    //   console.error('Failed to create new object, with error message: ' + error.message);
    // });
    // var todoFolder = new AV.Object('TodoFolder');
    // todoFolder.set('name', '工作');
    // todoFolder.set('priority', 1);

    var query = new AV.Query('TodoFolder');
    query.include("containedTodoslist");
    query.get('583e8eafa22b9d006c236a38').then(function (todoFolder) {
      // 成功获得实例
      // var todoFolder = AV.Object.createWithoutData('TodoFolder');
      var todo1 = new AV.Object('Todo');
      todo1.set('title', '工程师周会');
      todo1.set('content', '每周工程师会议，周一下午2点');
      todo1.set('location', '会议室');
      todo1.set('url', that.data.tempFilePaths);
      todo1.set('folder', AV.Object.createWithoutData('TodoFolder',"583e8eafa22b9d006c236a38"));
      // todo1.save();
      todoFolder.add("containedTodoslist",todo1);
      todoFolder.save();
      // var todo2 = new AV.Object('Todo');
      // todo2.set('title', '维护文档');
      // todo2.set('content', '每天 16：00 到 18：00 定期维护文档');
      // todo2.set('location', '当前工位');
      // todo2.set('url', that.data.tempFilePaths);
      // todo2.set('folder', todoFolder);

      // var todo3 = new AV.Object('Todo');
      // todo3.set('title', '发布 SDK');
      // todo3.set('content', '每周一下午 15：00');
      // todo3.set('location', 'SA 工位');
      // todo3.set('url', that.data.tempFilePaths);
      // todo3.set('folder', todoFolder);

      // var todos = [todo1, todo2, todo3];
      // AV.Object.saveAll(todos).then(function () {
      //   var relation = todoFolder.relation('containedTodos'); // 创建 AV.Relation
      //       relation.add(todo1);
      //   relation.add(todo2);
      //   // relation.add(todo3);

      //   console.log(relation);
      //   return todoFolder.save();// 保存到云端
      // }).then(function (todoFolder) {
      //   console.log(todoFolder);
      //   // 保存成功
      // }), function (error) {
      //   // 异常处理
      //    console.log(error);
      // };
      // todoFolder.add("containedTodoslist",todos);
      // todoFolder.save();// 保存到云端
      // todoFolder.add("containedTodoslist",todo1);
      // todoFolder.add("containedTodoslist",todoFolder.get("containedTodoslist"));
      // todoFolder.set("containedTodoslist",[todo1, todo2,todo3]);
      // todoFolder.save();// 保存到云端
    //   AV.Object.saveAll(todos).then(function () {
    //     todoFolder.add("containedTodoslist", todos);
    //     return todoFolder.save();// 保存到云端
    //   }).then(function (todoFolder) {
    //     console.log(todoFolder);
    //     // 保存成功
    //   }), function (error) {
    //     // 异常处理
    //     console.log(error);
    //   };

    }, function (error) {
      // 异常处理
      console.error(error);
    });


  },
  //添加3ge数据
  getfolders: function (e) {
    var that = this;
    var objectId = e.currentTarget.dataset.objectid;
    var targetTag = AV.Object.createWithoutData('Todo', objectId);
    var query = new AV.Query('TodoFolder');
    query.equalTo('containedTodos', targetTag);
    query.find().then(function (results) {
      // results 是一个 AV.Object 的数组
      // results 指的就是所有包含当前 tag 的 TodoFolder
      console.log(results);
    }, function (error) {
    });

  },
  //添加3ge数据
  comment: function (e) {
    var that = this;
    var objectId = e.currentTarget.dataset.objectid;
    var comment = new AV.Object('Comment');// 构建 Comment 对象
    comment.set('like', 1);// 如果点了赞就是 1，而点了不喜欢则为 -1，没有做任何操作就是默认的 0
    comment.set('content', '这个太赞了！楼主，我也要这些游戏，咱们团购么？');
    // 假设已知被分享的该 TodoFolder 的 objectId 是 5735aae7c4c9710060fbe8b0
    var targetTodoFolder = AV.Object.createWithoutData('Todo', objectId);
    comment.set('targetTodoFolder', targetTodoFolder);
    comment.save();//保存到云端

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
  login: function (e) {
    console.log('tapdologin ');
    getApp().checkLoginStatus(function (data){
         console.log("tapdologin succ"+data);
    });
  },
  //跳转到首页
  logout: function (e) {
    console.log('tapdologout ');
    getApp().logout();
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