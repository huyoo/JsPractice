/**
 * author: 黄豆子
 * decs: musicPlayer
 * time: 2017/12/17
 */
(function () {
    /** dom setting **/
    var audio = $("#audio")[0],
        /* 播放基础功能 */
        basePlayCtrl = {
            playBtn: $("#playBtn"), pauseBtn: $("#pauseBtn"),
            nextBtn: $("#nextBtn"), preBtn: $("#preBtn")
        },
        /* 音量、循环模式/进度条控制 */
        playSettingCtrl = {
            currentTime: $("#currentTime"), duration: $("#duration"), currentBar: $("#currentBar"),
            playModel: $("#playModelBtn"),
            volumeBtn: $("#volumeBtn"), volumeBar: $("#volumeBar"),
            volumeDot: $("#volumeDot"),currentVolBar: $("#currentVolBar")
        },
        /* 列表控制 增/删/清空 */
        listCtrl = {
            addBtn : $("#addBtn"), deleteBtn: $("#deleteBtn"),
            cleanBtn: $("#cleanBtn")
        },
        menuInfoCtrl = {
            img: $("#musicImg"), name: $("#musicName"), singer: $("#singer")
        },
        menu = $("#menu"),upload = $("#upload")[0],ifBool = false, volI = true;

    var songList = [{
        url: "music/时光(Piano Version).mp3",
        name: "时光(Piano Version)",
        image: "img/1221233.jpg",
        singer: "月吟诗"
    },{
        url: "music/黑暗中的身影.mp3",
        name: "黑暗中的身影",
        image: "img/109951163078616164.jpg",
        singer: "永远的七日之都"
    }];
    var imgArray = ["img/1221233.jpg", "img/6624557558467104.jpg", "img/7825224255126617.jpg",
        "img/18587244069690667.jpg", "img/19095218439644352.jpg", "img/109951163039378044.jpg",
        "img/109951163078696706.jpg", "img/109951163092271021.jpg", "img/109951163092536973.jpg"];

    var musicManager = new MusicManager();
    musicManager.init();

    basePlayCtrl.playBtn.click(function () {
        if (musicManager.getLength() === 0)
            return false;
        musicManager.playMusic();
    });
    basePlayCtrl.pauseBtn.click( function (ev) {
        if (musicManager.getLength() === 0)
            return false;
        musicManager.pauseMusic();
    });
    basePlayCtrl.nextBtn.click(function () {
        if (musicManager.getLength() === 0)
            return false;
        musicManager.nextMusic(true).setInfo();
    });
    basePlayCtrl.preBtn.click(function () {
        if (musicManager.getLength() === 0)
            return false;
        musicManager.preMusic().setInfo();
    });

    //切换播放模式
    playSettingCtrl.playModel.click(function () {
        musicManager.setLoop();
    });

    //音量设置
    playSettingCtrl.volumeBtn.click(function () {
        var i ;
        if (volI) {
            musicManager.setVolume(0);
            playSettingCtrl.volumeBtn.removeClass("fa-volume-up")
                .addClass("fa-volume-off").attr("title", "开启声音");
            playSettingCtrl.currentVolBar.css("width", "0px");
            volI = false
        } else {
            musicManager.setVolume(0.5);
            playSettingCtrl.volumeBtn.removeClass("fa-volume-off")
                .addClass("fa-volume-up").attr("title", "关闭声音");
            i  =  playSettingCtrl.volumeBar[0].offsetWidth/2;
            playSettingCtrl.currentVolBar.css("width", i + "px");
            volI = true;
        }
    });
    playSettingCtrl.volumeDot.mousedown(function (e) {
        ifBool = true;
        e.stopPropagation();
    });
    window.addEventListener("mouseup", function (e) {
        ifBool = false;
    });
    window.addEventListener("mousemove", function (e) {
        var volumeBar = playSettingCtrl.volumeBar[0];
        if(ifBool) {
            var volumeBar_x = getPosition(volumeBar).left,//长线条的横坐标
                currentVolBar,
                volumeBar_lg = volumeBar.offsetWidth;//长线条的长度

            if(!e.touches) {    //兼容移动端
                var x = e.clientX;
            } else {   //兼容PC端
                var x = e.touches[0].pageX;
            }

            currentVolBar = x - volumeBar_x; //小方块相对于父元素（长线条）的left值
            if(currentVolBar >= volumeBar_lg) {
                currentVolBar = volumeBar_lg;

            }else if(currentVolBar < 0) {
                currentVolBar = 0;
            }
            //设置拖动后小方块的left值
            playSettingCtrl.currentVolBar.css("width", currentVolBar + "px");
            musicManager.setVolume((currentVolBar / volumeBar_lg).toFixed(1));
        }
    });
    //添加歌曲
    listCtrl.addBtn.click(function () {
        upload.click();
    });
    listCtrl.cleanBtn.click(function () {
        musicManager.cleanList().cleanInfo().cleanPlayCtrl();
    });
    //文件选择处理
    upload.addEventListener("change", function () {
        var list = this.files, url, name, singer, image, addMus;
        for (var i=0; i< list.length; i++){
            //过滤异常文件格式
            if (list[i].type === "audio/mp3"){
                url = URL.createObjectURL(list[i]);
                name = list[i].name.split(".")[0];
                singer = name.split("-")[0];
                image = getImgURL();
                addMus = new Music(url, name, image, singer);
                musicManager.addMusic(addMus);
            }
        }
        this.value = "";//清空input值,方便重复添加；
    });
    //播放结束
    audio.addEventListener("ended",function () {
        musicManager.nextMusic(false).setInfo();
    });
    /******* 工具类 *******/
    //转换时间显示格式
    function changeTimeType(arg) {
        var timer = "",
            hour = parseInt(arg/3600),
            minute = parseInt(arg/60),
            second = parseInt(arg%60);
        if (minute > 59)
            minute = parseInt(minute%60);
        if (hour!==0)
            timer = hour +":";
        return timer + minute + ":"+ second;
    }
    //随机获取图像
    function getImgURL() {
        var index = Math.floor(Math.random() * imgArray.length);
        return imgArray[index];
    }
    //获取元素的绝对位置
    function getPosition(node) {
        var left = node.offsetLeft, //获取元素相对于其父元素的left值var left
            top = node.offsetTop;
        current = node.offsetParent; // 取得元素的offsetParent
        // 一直循环直到根元素
        while(current != null) {
            left += current.offsetLeft;
            top += current.offsetTop;
            current = current.offsetParent;
        }
        return {
            "left": left,
            "top": top
        };
    }

    function Music(url, name, image, singer) {
        this.url = url;
        this.name = name;
        this.image = image;
        this.singer = singer;
    }

    function MusicManager() {
        var musicList = songList,
            duration = 0,//总时长
            index = 0,//当前歌曲序号
            loop = 0,//0列表循环 1单曲循环 2列表随机
            music = musicList[0],
            list = [],
            header = {
                image: menuInfoCtrl.img,
                musicName: menuInfoCtrl.name,
                singer: menuInfoCtrl.singer
            };
        var timer;
        this.getLength = function () {
            return musicList.length;
        };
        /*****init player******/
        this.init = function () {
            audio.src = music.url;
            /** 歌曲列表**/
            for (var i=0 ;i < musicList.length ;i++){
                menu.append("<li>"+ musicList[i].name +"</li>");
                //list[i] = (musicList[i].name)
            }
            /**init info**/
            this.initInfo();
        };
        this.initInfo = function () {
            header.image.attr("src", music.image);
            header.musicName.html(music.name);
            header.singer.html(music.singer);
            return this;
        };
        /*******  player control  *******/
        this.playMusic = function () {
            var g = this;
            clearTimeout(timer);
            basePlayCtrl.playBtn.hide();
            basePlayCtrl.pauseBtn.show();
            audio.play();

            setTimeout( function(){
                duration = audio.duration;
                playSettingCtrl.duration.html(changeTimeType(duration));
            }, 400);
            timer = setInterval(this.setCurrentTime,500);
            return g;
        };
        this.pauseMusic = function () {
            audio.pause();
            basePlayCtrl.pauseBtn.hide();
            basePlayCtrl.playBtn.show();
            clearTimeout(timer);
            return this;
        };
        /**
         * 播放完毕 state=false 单曲循环时重复播放
         * 点击事件 state=true 单曲循环时进入后续播放
         * @param state
         * @returns {MusicManager}
         */
        this.nextMusic = function (state) {
            if (loop === 0 || (loop === 1 && state)){
                index === musicList.length-1 ? index= 0 : ++index;
                audio.src = musicList[index].url;
            }else if (loop === 2){
                index = Math.floor(Math.random() * musicList.length);
                audio.src = musicList[index].url;
            }
            this.playMusic();
            return this;
        };
        this.preMusic = function () {
            index === 0? index = musicList.length-1 : --index;
            audio.src = musicList[index].url;
            this.playMusic();
            return this;
        };
        /****** 循环模式设置 ******/
        this.setLoop = function () {
            ++loop===3? loop = 0: loop;
            switch (loop){
                case 0:
                    playSettingCtrl.playModel.removeClass("fa-random").addClass("fa-refresh")
                        .attr("title","全部循环");
                    break;
                case 1:
                    playSettingCtrl.playModel.removeClass("fa-refresh").addClass("fa-circle-o")
                        .attr("title","单曲循环");
                    break;
                case 2:
                    playSettingCtrl.playModel.removeClass("fa-circle-o").addClass("fa-random")
                        .attr("title","随机播放");
                    break;
            }
        };
        /*******  列表控制  *******/
        this.setList = function () {
            return this;
        };
        this.addMusic = function (arg) {
            var res = true;
            for (var i=0; i<musicList.length;i++){
                if(arg.name == musicList[i].name){//判断是否已存在
                    res = false;
                    break;
                }
            }
            if (res){
                musicList.push(arg);
                menu.append("<li>"+ arg.name +"</li>");
            }
        };
        /******* set info 歌曲信息显示*******/
        this.setInfo = function () {
            music = musicList[index];
            header.image.attr("src", music.image);
            header.musicName.html(music.name);
            header.singer.html(music.singer);
            return this;
        };
        /******* set progress 进度显示*******/
        this.updateProBar = function (arg) {
            var progress = (arg/duration) * 100;
            playSettingCtrl.currentBar.css("width", progress+"%");
            return this;
        };
        this.setCurrentTime = function () {
            var currentTime = audio.currentTime, setter;
            setter = changeTimeType(currentTime);
            playSettingCtrl.currentTime.html(setter);
            musicManager.updateProBar(currentTime);
            return this;
        };
        /*******  清空歌单  *******/
        this.cleanPlayCtrl = function () {
            audio.src = "";
            basePlayCtrl.pauseBtn.hide();
            basePlayCtrl.playBtn.show();
            return this;
        };
        this.cleanInfo = function () {
            header.image.attr("src", "img/u=3196947741,580496132&fm=27&gp=0.jpg");
            header.musicName.html("列表没有歌曲可播放");
            header.singer.html("列表没有歌曲可播放");
            return this;
        };
        this.cleanList = function () {
            musicList = [];
            menu.html("");
            return this;
        };
        /**  音量控制  **/
        this.setVolume = function (arg) {
            audio.volume = arg;
            return this;
        };
    }
})();
