// index.js

//声明数据库
const db = wx.cloud.database();
const userInfo = db.collection('userInfo');
const category = db.collection('category')

Page({
  //初始变量
  data: {
    categoryList: [],
    hidden: true,
    inputName: null,
    dec: null,
    imagePath: null,
    imagepath: null,
    removeImage: null,
  },

  //加载时获得分类数据
  onLoad: function(options) {
    category.get().then(res => {
      this.setData({
        categoryList: res.data
      })
    })
  },

  //跳转新增语音页
  navigateTo: function(result) {
    wx.showLoading({
      title: 'Jumping...',
    })
    wx.navigateTo({
      url: '../addpage/addpage',
    })
    wx.hideLoading()
  },

  //新增分类
  addcategory: function(e) {
    this.setData({
      hidden: !this.data.hidden
    })
  },

  //确认  
  confirm: function(event) {
    this.setData({
      hidden: true
    });

    //选择分类添加的图片
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({
          imagePath: res.tempFilePaths.join('')
        })

        //上传分类图片
        wx.cloud.uploadFile({
          cloudPath: this.data.inputName + +Math.floor(Math.random() * 1000000).toString() + '.jpg',
          filePath: this.data.imagePath,
        }).then(res => {
          this.setData({
            imagepath: res.fileID
          })

          //新增category数据库记录
          db.collection('category').add({
            data: {
              dec: this.data.dec,
              image: this.data.imagepath,
              Type: this.data.inputName,
            }
          }).then(res => {
            wx.showToast({
              title: 'Add Succeed!',
              icon:"none",
            })
            wx.redirectTo({
              url: '../indexpage/indexpage',
            })
          }).catch(err => {
            wx.showToast({
              title: 'Uploading Fail',
              icon: 'none'
            })
          })
        }).catch(error => {
console.log(error)
        })
      }
    })
  },

  //取消按钮  
  cancel: function() {
    this.setData({
      hidden: true
    });
  },

  //新增分类名称
  name: function(value) {
    this.data.inputName = value.detail.value;
    console.log(this.data.inputName)
  },

  //新增分类描述
  dec: function(value) {
    this.data.dec = value.detail.value;
    console.log(this.data.dec)
  },

  //删除自定义分类
  remove: function(event) {
    wx.showModal({
      title: 'Delete Category',
      content: 'Are you sure to delete this category?',
      success: (res) => {
        if (res.confirm) {

          //获得分类图片信息
          category.where({
              _id: event.currentTarget.id
            })
            .get({
              success: (res) => {
                console.log(res)
                this.setData({
                  removeImage: res.data[0].image,
                })

                //删除存储器中图片文件
                wx.cloud.deleteFile({
                  fileList: [this.data.removeImage],
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
          db.collection('category').doc(event.currentTarget.id).remove({
            success: res => {
              wx.showToast({
                title: 'Delete Succeed!',
                icon:"none",
                duration: 1500,
              })
              wx.redirectTo({
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
  }
})