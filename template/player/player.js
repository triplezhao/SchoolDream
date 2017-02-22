const util = require('../../utils/util.js');
const QN = require('../../utils/qiniuutil.js');
var playTimeInterval;
var animationInterval;
module.exports = {

  load: function (_this) {
    let that = _this;
    let i = 1;
    animationInterval = setInterval(function () {
      i++;
      if (i > 65500) {
        i = 0;
      }
      i = i % 3;
      _this.setData({
        animationtime: i
      });
    }, 800);

    that.setData({
      animationtime: 0,
      playTime: 0,
      playingindex: -1,
      playing: false,
      formatedPlayTime: util.formatTime(that.data.playTime)
    })
  },

  playVoice: function (_this, e) {

    this.stopVoice(_this, e);

    let that = _this;
    let player_that = this;
    let index = e.currentTarget.dataset.index;
    var voiceurl = e.currentTarget.dataset.voiceurl;
    var httpsurl = QN.genHttpsDownUrl(voiceurl);
    if (that.data.playing == true && that.data.playingindex == index) {
      return;
    }

    //内存中如果有这个音频，直接播放
    if (that.data.voiceurlmap[QN.base64encode(httpsurl)]) {
      player_that.play(that, that.data.voiceurlmap[QN.base64encode(httpsurl)], index);
      return;
    } else {
      try {
        var value = wx.getStorageSync(QN.base64encode(httpsurl));
        //本地中如果有这个音频，直接播放
        if (value) {
          // Do something with return value
          that.data.voiceurlmap[QN.base64encode(httpsurl)] = value;
          player_that.play(that, that.data.voiceurlmap[QN.base64encode(httpsurl)], index);
          return;
        }
      } catch (e) {
        // Do something when catch error
      }

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

        //存储到本地
        wx.saveFile({
          tempFilePath: download_res.tempFilePath,
          success: function (res) {
            var savedFilePath = res.savedFilePath;
            try {
              wx.setStorage({
                key: QN.base64encode(httpsurl),
                data: savedFilePath
              })
               //2.再播放
            that.data.voiceurlmap[QN.base64encode(httpsurl)] = savedFilePath;
            player_that.play(that, savedFilePath, index);
            } catch (e) {

            }
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
  //2.再播放
  play: function (_this, path, index) {
    let that = _this;
    that.setData({
      playing: true,
      playingindex: index,
      downloading_fail_index: -1,
    })
    clearInterval(playTimeInterval)
    playTimeInterval = setInterval(function () {
      that.data.playTime += 1
      that.setData({
        formatedPlayTime: util.formatTime(that.data.playTime)
      }
      )
    }, 500)

    setTimeout(() => {
      wx.playVoice({
        filePath: path,
        success: function (res) {
          // success
          console.log('playVoice success');

        },
        fail: function () {
          // fail
          console.log('playVoice fail');
          that.showToast('playVoice失败');
        },
        complete: function () {
          // complete
          that.data.playTime = 0
          that.setData({
            playing: false,
            formatedPlayTime: util.formatTime(that.data.playTime)
          })
          console.log('playVoice complete');
          clearInterval(playTimeInterval)
        }
      })
    }, 1000);
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

