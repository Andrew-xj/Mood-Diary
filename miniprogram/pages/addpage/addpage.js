// addpage.js
//引入数据库
const db = wx.cloud.database()
const voice = db.collection('voice')
const category = db.collection('category')
//建立新数组
const categoryList = new Array()
//创建录音对象
const recorderManager = wx.getRecorderManager()
const options = {
  duration: 60000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 1,
  encodeBitRate: 192000,
  format: 'mp3',
  frameSize: 1024
}

Page({
  //初始数据
  data: {
    inputName: null,
    category: '',
    range: null,
    fileName: null,
  },

  onLoad: function(options) {
    //获取category数据库数据
    category.get().then(res => {
      for (var i = 0; i < res.data.length; i++) {
        categoryList[i] = res.data[i].Type
      }
      this.setData({
        range: categoryList
      })
    })
  },

  //picker选择后改变内容
  category: function(e) {
    console.log(e)
    this.setData({
      category: categoryList[e.detail.value]
    })
    console.log(this.data.category)
  },

  //获取input内容
  name: function(value) {
    this.data.inputName = value.detail.value;
  },

  //开始录音
  startRecode: function(event) {
    wx.showToast({
      title: 'Start Recording',
      icon: "none",
      duration: 500,
    })
    recorderManager.onFrameRecorded((res) => {
        const frameBuffer = res.frameBuffer
        const isLastFrame = res.isLastFram
      }),
      recorderManager.start(event)
  },

  //结束录音
  endRecode: function(event) {
    recorderManager.stop()
    wx.showToast({
      title: 'Uploading Voice',
      icon: "none",
      duration: 500,
    })
    recorderManager.onStop((res) => {
      console.log(res.tempFilePath)
      this.setData({
        fileName: this.data.inputName + Math.floor(Math.random() * 1000000).toString()
      })
      this.setData({
        tempFilePaths: res.tempFilePath
      })

      //上传录音
      wx.cloud.uploadFile({
        cloudPath: this.data.fileName + '.mp3',
        filePath: this.data.tempFilePaths,
        success: res => {

          //新增voice数据库数据
          voice.add({
            data: {
              filePath: res.fileID,
              fileName: this.data.inputName,
              category: this.data.category
            }
          }).then(res => {
            wx.showToast({
              title: 'Succeed!',
              icon: 'success',
              duration: 1000,
            })
          })
          console.log(res.fileID)
        },
        fail: console.error
      })
    })
  }
})