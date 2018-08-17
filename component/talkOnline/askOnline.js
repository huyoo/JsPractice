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
            if(!this.options.slider){
                throw "slider can't be null if you use scroll feature";
            } 
            that._bind($(that.options.ele+">"+that.options.slider).find("div")[0], EVENT.MOUSEDOWN);
            that._bind($(document)[0], EVENT.MOUSEUP);
            that._bind($(that.options.ele+">"+that.options.content)[0], EVENT.MOUSEWHEEL);
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
            
            if(y > 0) return;
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
            this.options.slider && this._slider();
        },
        //滑块移动
        _slider: function(){
            var that = this, 
                options = that.options,
                ele = $(options.ele);
                slider = ele.find(options.slider),
                height = ele.find(options.content).height();
                parentHeight = ele.height(),
                y = that.y;
            
            slider.removeClass("hide");
            var top;

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
    
    
// function wheelScroll(ev, scrollDown){
//     // $(ev.currentTarget).css({
//     //     "transition-property": "-webkit-transform",
//     //     "transform-origin": "0px 0px 0px",
//     //     "transform": "translate(0px, -205px) scale(1)"
//     // })
// }

;(function (){
    var newMsg = new Scroll({ ele: ".new_msg" }),
        historyMsg = new Scroll({ ele: ".history_msg" }),
        entList = new Scroll({ ele: ".ent_list" }),
        
        msgArr = [{
            name: "",
            content: "content",
            date: new Date(),
        }];

    newMsg.toBottom();
    historyMsg.toBottom();

    var handler = {
        handleEvent: function(ev){
            var that = this, 
                className;

            className = $(ev.target).attr("class").split(/\s/);
            className.forEach(function(i){
                switch(i){
                    case "btn_history": that._history(ev); break;
                    case "btn_close": that._close(ev); break;
                    case "btn_submit": that._submit(ev); break;
                    case "input_area": that._submit(ev); break;
                    case "btn_search": that._searchShow(ev); break;

                    case "btn_latest": that._toFirstPage(ev); break;
                    case "btn_next": that._lastPage(ev); break;
                    case "btn_last": that._nextPage(ev); break;
                    case "btn_lastest": that._toLastPage(ev); break;
                    case "btn_warn": that._warnHandle(ev); break;
                }
            });
        },
        _history: function(ev){
            var className = $(".now").attr("class");
            if(className.indexOf("full_view") >= 0){
                $(".now").removeClass("full_view").addClass("half_view");
                $(".history").removeClass("hide");
                historyMsg.toBottom();
            } else {
                $(".now").removeClass("half_view").addClass("full_view");
                $(".history").addClass("hide");
            }
        },
        _close: function(ev){
            $(".now").removeClass("half_view").addClass("full_view");
            $(".history").addClass("hide");
        },
        _submit: function(ev){
            var val = $("textarea").val();
            if(ev.keyCode != 13 && ev.type !== "click")
                return;
            if(!val.length ||/^(\n|\s)*$/.test(val))
                return "信息为空,不能发送!"

            val = val.replace(/\s/g, "&nbsp;");
            if(val.length > 200)
                return "输入信息过长";

            send(val);
            $("textarea").val("");
        },
        _searchShow: function(ev){
            var that = this;

            var t = $(ev.target);
            t.parent().children().map(function(i){
                // console.log(dom);
                t.parent().children(i).hide();
            });
            $(".search_box").removeClass("hide").attr("style","");
        },
        _toFirstPage: function(){},
        _lastPage: function(){},
        _nextPage: function(){},
        _toLastPage: function(){},
        _warnHandle: function(ev){
            var val = $(ev.target).next().html();
            $(ev.target).parent().remove();
            send(val);
        },
        bind: function(){
            var that = this;

            if(arguments.length === 1){
                if(typeof arguments[0] != "object"){
                    throw "arguments is error"
                }
                var obj = arguments[0];
                for(var ele in obj){
                    $(ele)[0].addEventListener(obj[ele], that, false);
                }
            }else{
                $(arguments[0])[0].addEventListener(arguments[1], that, !!arguments[2]);
            }
        }
    }

    handler.bind({
        ".btn_history": "click",
        ".btn_close": "click",
        ".btn_submit": "click",
        ".input_area": "keyup",
        ".btn_search": "click",
        ".btn_lastest": "click",
        ".btn_last": "click",
        ".btn_next": "click",
        ".btn_latest": "click",
        ".btn_warn": "click",
    });

    $(".ent_list .content").on("click", function(ev){
        ev.stopPropagation();
        ev.preventDefault();
        var t, name;
        if(ev.target.nodeName == "DIV"){
            t = $(ev.target).find(".name");
        }else {
            t = $(ev.target);
        }
        name = t.attr("data-title");
        $("span[data-title='entName']").html(name);
        $(".ent_list .content> div").removeClass("bg_blue");
        t.parent().addClass("bg_blue");
    });
    // 
    $(".search_box > span").on("click", function(ev){
        $(".search_box").parent().children().map(function(i){
            $(".search_box").parent().children(i).attr("style", "");
        });
        $(".search_box").addClass("hide");
    });
    function send(content){
        //发送操作
        var msg = {
            name: "",
            content: content,
            date: new Date(),
        };
        msgArr.push(msg);
        if(msgArr.length>1 && util.checkTime(msgArr[msgArr.length -1].date, msgArr[msgArr.length -2].date)){
            $(".new_msg > .content").append("<div class='date'><span>"+ util.format("", "yyyy-MM-dd HH:mm") +"</span></div>");
        }
        $(".new_msg > .content").append("<div class='mine'><p>"+ msg.content +"</p></div>");

        newMsg.toBottom();
    }
    var util = {
        //检查消息是否距离上一条消息超过五分钟
        checkTime: function(mgsDate, lastDate){
            if(!mgsDate instanceof Date || !mgsDate instanceof Date){
                throw "arguments is not Date";
            }
            return (mgsDate - lastDate) > 120000;
        },
        //时间格式转换
        format: function(time, format){
            var t = new Date();
            var tf = function(i){return (i < 10 ? '0' : '') + i};
            return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
                switch(a){
                    case 'yyyy':
                        return tf(t.getFullYear());
                        break;
                    case 'MM':
                        return tf(t.getMonth() + 1);
                        break;
                    case 'mm':
                        return tf(t.getMinutes());
                        break;
                    case 'dd':
                        return tf(t.getDate());
                        break;
                    case 'HH':
                        return tf(t.getHours());
                        break;
                    case 'ss':
                        return tf(t.getSeconds());
                        break;
                };
            });
        },
    }
})();