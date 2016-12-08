function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds();


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
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
  formatTime: formatTime,
  getTs: getTs
}
