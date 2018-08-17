/**
 * @desc: 滚动组件
 * @author: yu.hu
 * @date: 2018/7/31 10:07
 * @use: new Scroll({
 *          ele: ".className"或"#id",    //展示信息的窗口dom，默认为空，必须填值
 *          content: ".className"或"#id",//存放信息的dom，默认为".content"
 *          slider:".className"或"#id",  //滑块dom，默认为".slider"
 *          isScroll: true/false         //是否使用滚动功能，默认开启
 *       })
 */
;(function(win){
    var EVENT = {
        MOUSEDOWN : "mousedown",
        CLICK: "click",
        MOUSEWHEEL: "mousewheel",
        MOUSEUP: "mouseup",
        MOUSEMOVE: "mousemove"
    };
    function Scroll (obj){
        var that = this;

        that.options = {
            ele: null,//主容器
            content: ".content",//内容容器,需要滚动的dom
            slider: ".slider",//滑块标识
            isScroll: true,//是否使用滚动功能
        }
        that.version = '0.1';
        for(var i in obj) that.options[i] = obj[i];

        if(!that.options.ele){
            throw "ele can't be null";
        }

        if(that.options.isScroll){
            var $slider = $(that.options.ele+">"+that.options.slider),
                $content = $(that.options.ele+">"+that.options.content);
            if(!$slider.length || !$content.length){
                throw "slider or content can't be null if you use scroll";
            }
            that._bind($slider.find("div")[0], EVENT.MOUSEDOWN);
            that._bind($(document)[0], EVENT.MOUSEUP);
            that._bind($content[0], EVENT.MOUSEWHEEL);
        }
    };
    Scroll.prototype = {
        x: 0,
        y: 0,//垂直方向偏移量
        isDrag: false,
        handleEvent: function(ev){
            var that = this;

            switch(ev.type){
                case EVENT.MOUSEWHEEL: that._wheel(ev); break;
                case EVENT.MOUSEDOWN: that._drag(ev); break;
                case EVENT.MOUSEUP: that._removeDragEvent(); break;
                case EVENT.MOUSEMOVE: that._dragMove(ev); break;
            }
        },
        toBottom: function(){
            var that = this,
                x, y, ele = $(that.options.ele).find(that.options.content),
                height, parentHeight;

            if(ele.length > 1) {
                throw "ele is not only dom";
            }

            height = ele.height();
            parentHeight = ele.parent().height();
            y = parentHeight - height -20;

            if(y > 0) {
                that.y = 0;
                that._move(0, 0);
                that.options.isScroll && $(that.options.ele).find(that.options.slider).addClass("hide");
                return;
            }
            that.y = y;
            that._move(0, y);
        },
        toTop: function(){
            this.y = 0;
            this._move(0, 0);
        },
        //内容移动
        _move: function(clientX, clientY){
            $(this.options.ele).find(this.options.content).css("transform", "translate("+ clientX +"px, "+clientY +"px) scale(1)");
            this.options.isScroll && this._slider();
        },
        //滑块移动
        _slider: function(){
            var that = this,
                options = that.options,
                ele = $(options.ele),
                slider = ele.find(options.slider),
                height = ele.find(options.content).height(),
                parentHeight = ele.height(),
                y = that.y,
                top;

            slider.removeClass("hide");

            if(y === 0){
                top = 0;
            }else{
                top = (- y)/(height - parentHeight + 20);
                top = top * (parentHeight - slider.find("div").height());
            }
            slider.find("div").css("top", top+"px");
        },
        //滚轮操作
        _wheel: function(ev){
            var that = this,
                x, y,
                target = $(ev.currentTarget),
                ele = target.parent(),
                height = target.height(),
                parentHeight = ele.height(),
                up = ev.wheelDelta > 0;

            ev.stopPropagation();
            ev.preventDefault();

            if( parentHeight > height) return;
            y = that.y + (up? + 60: -60);
            //位移量判断
            //移到下面是负值，最顶部的y为0
            if( y > 0){
                //大于0时，已经移到最顶部了，因此需要修正成0
                y = 0;
            }else if((parentHeight - y) > height){
                //移到最底部(最新的消息),即窗口高度-位移量=消息容器的高度，
                //位移量为负值，所以是减
                //最后再减去20，使下方留出背景，优化显示效果
                y =  parentHeight - height -20;
            }

            that.y = y;
            that._move(0, y);
        },
        //监测鼠标点下的操作，开启鼠标移动监测
        _drag: function(ev){
            var that = this;

            $(that.options.ele).find(that.options.slider).css({
                "user-select": "none",
                "-moz-user-select": "none",
                "-webkit-user-select": "none"
            });
            that._bind($(document)[0],"mousemove");
            that.isDrag = true;
        },
        //监测鼠标拖动到的位置
        _dragMove: function(ev){
            var that = this;
            if(!that.isDrag) return;

            var y = ev.pageY,
                content = $(that.options.ele).find(that.options.content)[0],
                parent = $(that.options.ele).find(that.options.slider)[0],
                parentTop =  that._getElementTop(parent);

            if(y < parentTop){
                //鼠标移到滚动条上方时，滚动到顶部
                that.y = 0;
            } else if(y > (parentTop + parent.clientHeight)){
                //鼠标移到滚动条下方时，固定为滚动到最下方
                //多加20是为了下方留出空白
                that.y = content.clientHeight - content.parentNode.clientHeight + 20;
            } else {
                // 计算鼠标移动距离占掉整个滚动条高度的百分比
                // 乘以内容的可移动高度
                that.y = (y - parentTop)/parent.clientHeight * (content.clientHeight - content.parentNode.clientHeight);
            }
            that.y = -that.y;
            that._move(0, that.y);
        },
        //移除拖动监测
        _removeDragEvent: function(){
            var that = this;
            if(!that.isDrag) return;

            that.isDrag = !that.isDrag;
            $(that.options.content).css({
                "user-select": "auto",
                "-moz-user-select": "auto",
                "-webkit-user-select": "auto"
            });
            document.onmousemove = null;
        },
        //获取dom到浏览器顶部的距离
        _getElementTop: function(ele){
            return ele.offsetParent !== null ?
                (ele.offsetTop + this._getElementTop(ele.offsetParent)) : 0;
        },
        //绑定事件
        _bind: function(ele, type, bubble){
            ele.addEventListener(type, this, !!bubble);
        }
    };
    win.Scroll = Scroll;
})(window);