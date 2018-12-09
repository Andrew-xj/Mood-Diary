//startpage.js 

const app = getApp()
//声明数据库
const db = wx.cloud.database()
const photos = db.collection('photos')

Page({

  data: {
    userList: [],
  },

  onLoad: function (options) {
    //授权录音功能
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              console.log('录音授权成功')
            }
          })
        }
      }
    })

    wx.showLoading({
      title: 'Loading...',
    })
  },

  onReady: function() {
    //自动跳转
    setTimeout(function() {
      wx.redirectTo({
        url: '../indexpage/indexpage'
      })
    }, 2000)
  }
})