const AV = require('../utils/leancloud-storage');


class WxPushQueue extends AV.Object {

// pushkey
// pushtype 新人进入班级：newstudent,同学发布新状态：newarticle,
// pushdata


// touser：接收者（用户）的 openid
// template_id：所需下发的模板消息的id
// page：点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?id=0）。该字段不填则模板无跳转。
// form_id：表单提交场景下，为 submit 事件带上的form_Id；支付场景下，为本次支付的prepay_id
// value：模板内容，不填则下发空模板
// color：模板内容字体的颜色，不填默认黑色
// emphasis_keyword：模板需要放大的关键词，不填则默认无放大

//本地拼好，发到server
// {
//   "touser": "OPENID",  
//   "template_id": "TEMPLATE_ID", 
//   "page": "index",          
//   "form_id": "FORMID",         
//   "data": {
//       "keyword1": {
//           "value": "339208499", 
//           "color": "#173177"
//       }, 
//       "keyword2": {
//           "value": "2015年01月05日 12:30", 
//           "color": "#173177"
//       }, 
//       "keyword3": {
//           "value": "粤海喜来登酒店", 
//           "color": "#173177"
//       } , 
//       "keyword4": {
//           "value": "广州市天河区天河路208号", 
//           "color": "#173177"
//       } 
//   },
//   "emphasis_keyword": "keyword1.DATA" 
// }



}

AV.Object.register(WxPushQueue);
module.exports = WxPushQueue;
