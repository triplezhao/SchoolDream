const util = require('../../utils/util.js');
const QN = require('../../utils/qiniuutil.js');
var playTimeInterval;
module.exports = {

  load: function (_this) {
    let that = _this;
    that.setData({
      playTime: 0,
      playingindex: -1,
      playing: false,
      formatedPlayTime: util.formatTime(that.data.playTime)
    })
  },

  playVoice: function (_this, e) {

    this.stopVoice(_this, e);

    let that = _this;
    let index = e.currentTarget.dataset.index;
    var voiceurl = e.currentTarget.dataset.voiceurl;
    var httpsurl = QN.genHttpsDownUrl(voiceurl);
    if (that.data.playing == true && that.data.playingindex == index) {
      return;
    }


    that.setData({
      downloading_index: index,
    })

    //1.先下载
    wx.downloadFile({
      url: httpsurl,
      success: function (download_res) {
        console.log(download_res);
        if (that.data.playing == true && that.data.playingindex == index) {
          return;
        }
        //2.再播放
        let path = download_res.tempFilePath;

        that.setData({
          playing: true,
        })
        clearInterval(playTimeInterval)
        playTimeInterval = setInterval(function () {
          that.data.playTime += 1
          that.setData({
            playingindex: index,
            formatedPlayTime: util.formatTime(that.data.playTime)
          }
          )
        }, 1000)

        wx.playVoice({
          filePath: path,
          success: function (res) {
            // success
            console.log('playVoice success');
            that.data.playTime = 0
            that.setData({
              playing: false,
              formatedPlayTime: util.formatTime(that.data.playTime)
            })
          },
          fail: function () {
            // fail
            console.log('playVoice fail');
            that.showToast('playVoice失败');
          },
          complete: function () {
            // complete
            console.log('playVoice complete');
            clearInterval(playTimeInterval)
          }
        })
      },
      fail(error) {
        console.log(error)
         that.setData({
          downloading_fail_index: index,
        })
      },
      complete(download_res) {
        console.log(download_res)
        that.setData({
          downloading_index: -1,
        })
      }
    })




  },
  pauseVoice: function (_this, e) {
    let that = _this;
    wx.pauseVoice({
      success: function (res) {
        // success
        console.log('pauseVoice success');
      },
      fail: function () {
        // fail
        console.log('pauseVoice fail');
      },
      complete: function () {
        // complete
        console.log('pauseVoice complete');
        that.setData({
          playing: false
        })
        clearInterval(playTimeInterval)
      }
    })

  },
  stopVoice: function (_this, e) {
    let that = _this;
    clearInterval(playTimeInterval)
    that.data.playTime = 0
    that.setData({
      playing: false,
      formatedPlayTime: util.formatTime(that.data.playTime)
    })
    wx.stopVoice({
      success: function (res) {
        // success
        console.log('stopVoice success');
      },
      fail: function () {
        // fail
        console.log('stopVoice fail');
      },
      complete: function () {
        // complete
        console.log('stopVoice complete');

      }
    })
  },
}

