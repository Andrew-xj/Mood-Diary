//category.js

//声明数据库+引用工具
const db = wx.cloud.database()
const category = db.collection('category')
const voice = db.collection('voice')
const util = ("../../utils/util.js")

Page({
  //自定义数据
  data: {
    categoryList: [],
    voiceList: [],
    fileID: [],
    voicePath: null,
    localPath: null,
    id: null,
    counter: true,
    removePath: null,
    id: null,
  },

  onLoad: function(options) {
    //Loading字样
    wx.showLoading({
      title: 'Loading...',
    })
    setTimeout(function() {
      wx.hideLoading()
    }, 2000)

    //从数据库获得分类数据
    category.where({
      _id: options.id
    }).get().then(res => {
      this.setData({
        categoryList: res.data,
      })
      //从数据库获得音频数据
      voice.where({
        category: this.data.categoryList[0].Type,
      }).get().then(res => {
        this.setData({
          voiceList: res.data,
        })
      })
    })
  },

  play: function(event) {
    wx.showToast({
      title: 'Downloading',
      icon: 'download',
      duration: 1000
    })

    //数据库获取音频信息
    voice.where({
      _id: event.target.id
    }).get().then(res => {
      this.data.voicePath = res.data[0].filePath

      // 下载音频
      wx.cloud.downloadFile({
        fileID: this.data.voicePath,
        success: ((res) => {
          this.setData({
            localPath: res.tempFilePath
          })

          //播放音频
          const innerAudioContext = wx.createInnerAudioContext()
          innerAudioContext.autoplay = true
          innerAudioContext.src = this.data.localPath
          innerAudioContext.onStop(() => {
            innerAudioContext.destroy()
            this.setData({
              localPath: null,
            })
          })
          innerAudioContext.onPlay(() => {})
          innerAudioContext.onError((res) => {
            innerAudioContext.destroy()
          })
          innerAudioContext.onEnded((res) => {
            innerAudioContext.destroy()
            this.setData({
              localPath: null,
              id: null,
            })
          })
        }),
        fail: ((err) => {
          wx.showToast({
            title: 'Please Try Again',
            icon: 'none',
            duration: 500,
          })
        }),
      })
    }).catch(err => {
      wx.showToast({
        title: 'Please Try Again',
        icon: "none",
      })
    })
    this.setData({
      counter: !this.data.counter
    })
  },

  //删除历史语音
  remove: function(event) {
    //确认是否删除语音
    wx.showModal({
      title: 'Delete Voice',
      content: 'Are you sure to delete this voice?',
      success: (res) => {
        if (res.confirm) {

          //获得语音信息
          voice.where({
              _id: event.currentTarget.id
            })
            .get({
              success: (res) => {
                this.setData({
                  removePath: res.data[0].filePath,
                })
                console.log(this.data.removePath)
                //删除存储器语音文件
                wx.cloud.deleteFile({
                  fileList: [this.data.removePath],
                  success: res => {
                    console.log(res.fileList)
                  },
                  fail: err => {
                    console.log(err)
                  }
                })
              },
              fail: (err) => {
                console.log(err)
              }
            })

          //删除voice数据库记录
          db.collection('voice').doc(event.currentTarget.id).remove({
            success: res => {
              wx.showToast({
                title: 'Succeed!',
                icon: "success",
                duration: 1000,
              })
              wx.navigateBack({
                url: '../indexpage/indexpage'
              })
            },
            fail: err => {
              wx.showToast({
                icon: 'none',
                title: 'Delete Fail',
              })
              console.error('[数据库] [删除记录] 失败：', err)
            }
          })
        } else if (res.cancel) {

        }
      }
    })
  },
})