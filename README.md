# uploader
自身使用的图片上传插件
基于jquery。
## 主要功能：
1. 实现本地图片的上传功能
2. 实现网络的图片的上传功能
3. 本地图片的选择
## 方法调用：
```ruby
$('*').imgModal({});
end
```
## 传参：
```ruby
selectImgPopupBtn                     // 图片选择 弹框的按钮
selectImgBtn                          // 图片选择 的按钮
selectImgPopupTemplate                // 图片选择 渲染的模板
selectImgPopupTitle                   // 图片选择 模板的标题
selectSuccess:function(item,target){} // 图片选择 选择成功的回调函数(多张分次上传返回data[])

newImgBtn                             // 图片上传 弹框的按钮
type                                  // 图片上传 的格式
times                                 // 图片上传 规定上传的张数最多为5张;
multiple                              // 图片上传 是否支持多张一起选择      默认为 false
biz_code                              // 图片上传 上传所用的biz_code
user_id                               // 图片上传 上传所用的user_id
uploadSuccess                         // 图片上传 上传成功的回调函数（多张一起上传返回data[]）
end
```