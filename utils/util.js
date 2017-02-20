function yyyymmdd(time) {

  var date = new Date(time);
  var seperator1 = "-";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}
function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  var hour = parseInt(time / 3600)
  time = time % 3600
  var minute = parseInt(time / 60)
  time = time % 60
  var second = time

  return ([hour, minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}


function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function getTs(stringTime) {
  var timestamp2 = Date.parse(new Date(stringTime));
  return timestamp2;
}

function isToday(date) {
  if(!date){
    return false;
  }
  var today = new Date();
   //获取从今天0点开始到现在的时间
   var todayTime = today.getTime()%(1000*60*60*24);
    //获取要判断的日期和现在时间的偏差
   var offset = date.getTime() - today.getTime();
    //获取要判断日期距离今天0点有多久
   var dateTime = offset + todayTime;

  if (dateTime < 0 || dateTime > 1000 * 60 * 60 * 24) {
    return false;
  } else {
    return true;
  }
 
}

module.exports = {
  yyyymmdd: yyyymmdd,
  formatTime: formatTime,
  getTs: getTs,
  isToday: isToday
}
