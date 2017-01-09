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

module.exports = {
  yyyymmdd: yyyymmdd,
  formatTime: formatTime,
  getTs: getTs
}
