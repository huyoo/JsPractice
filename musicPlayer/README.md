## 记录
## 1.0.0 版本
### 功能记录
1. 播放主要实现了音乐的播放、暂停、上/下一首、音量滑动控制、音乐播放进度显示;
2. 歌曲信息显示由 MusicManager 管理控制，songList存放，切换歌曲时可以调用setInfo()切换到当前播放的歌曲;
3. 添加本地歌曲到播放列表，部分歌曲信息从名称中截取，歌曲图片从图片库中随机调用;
### 待解决
1. 媒体播放浏览器目前功能兼容性不佳；
2. 添加本地歌曲存在浏览器不兼容，目前只能在谷歌内核的浏览器上使用；
3. 网络延迟处理未成功，特别是在低网速的情况下，使用不流畅；
4. 歌单目前没有歌曲被播放的提示