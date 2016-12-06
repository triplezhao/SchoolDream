const AV = require('../../utils/leancloud-storage');
const Student = require('../../model/Student');

Page({
  data:{
    text:"Page wode",
    student:null,
    loadingHidden:false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
   var that = this;
     getApp().checkLoginStatus(function (code,data){
       if(code==1){
          that.setData({
          // 拼接数组
          loadingHidden: true,
          text:'sadfasdf',
          student:data
        })
       }else{
         that.setData({
          // 拼接数组
          loadingHidden: true,
          student:data
        })
       }
        
    });


  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})