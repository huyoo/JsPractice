'use strict';
/**
 * 结束界面待改进
 * 本地存储保存近期成绩
 */
(function (win, factory) {
    if (typeof define === 'function' && define.amd) {
        define('gameManager', factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        win.GameManager = factory();
    }
})(window, function () {
    var i;
    function GameManager() {
        this.version = '1.0';
        this.def = {
            content: tool.getDom('content'),
            menu : tool.getDom('title'),
            start : tool.getDom('start'),
            repeat: tool.getDom('repeat'),
            heart: tool.getDom('heart'),
            level: 1,//关卡
            data: null, //存放页面方块数据
            score: 0, //得分
            hard: 3, //难度
            curtain: 0,//当前没有被找出的方块
            wait: true,
            first: true,
        };
        this.waiting();
    };

    var proto = GameManager.prototype;
    proto.constructor = GameManager;
    /**
     * 等待游戏开始
     */
    proto.waiting = function () {
        var _this = this;
        this.def.level = 1;
        this.def.score = 0;
        this.def.hard = 3;
        this.def.wait = true;
        /***  剩余机会 ***/
        for(i = 0; i < 3; i++){
            var img = tool.createDom('img');
            tool.setAttr(img, { 'src' : 'image/heart.png' });
            this.def.heart.appendChild(img);
        }


        if(this.def.first) {
            tool.addEvent(_this.def.start, 'click', function () {
                tool.setAttr(_this.def.start.parentNode, {'style': 'display: none'});
                tool.setAttr(_this.def.start.parentNode.parentNode, {'style': 'display: none'});
                _this.init();
            });
            tool.addEvent(_this.def.repeat, 'click', function () {
                tool.setAttr(_this.def.repeat.parentNode, {'style': 'display: none'});
                tool.setAttr(_this.def.repeat.parentNode.parentNode, {'style': 'display: none'});
                _this.init();
            });

        } else {
            /** 黑幕展示 **/
            tool.setAttr(this.def.repeat.parentNode, { 'style' : 'display: block'});
            tool.setAttr(this.def.repeat.parentNode.parentNode, { 'style' : 'display: block' });
        }
    };
    /**
     * 初始化游戏界面
     */
    proto.init = function () {
        var def = this.def;
        def.data = this.getRandom(def.hard);
        def.curtain = def.hard;
        this.create(def, def.data);
        this.def.first && tool.addEvent(def.content, 'click', clickHandler(this));//添加监听
        this.score(def);
    };

    //得分管理
    proto.score = function () {
        var arg = arguments[0];
        if(!arg && arg !== 0) return;
        var def = this.def;
        if (typeof arg === 'object'){
            arg.data.score = 0;
            arg.data.level = 1;
        }else if (!isNaN(arg)){
            if(def.data[arg].isTarg){
                def.data[arg].isTarg = false;
                def.score += def.hard;
                --def.curtain;
            }else {
                var length = def.heart.children.length;
                if (!length){
                    this.end();
                }else
                    tool.removeDom(def.heart, length - 1);
            }
        }
        tool.html(tool.getDom('level'), def.level);
        tool.html(tool.getDom('score'), def.score +'');
        this.data();
    };

    proto.data = function () {
        var def = this.def, _this = this;
        if (!def.curtain){
            if (def.hard === def.level)
                ++def.hard;
            ++ def.level;
            setTimeout(function () {
                _this.reset();
                _this.init();
            }, 400);
        }
    };
    //创建内容
    proto.create = function (def, data) {
        for(i = 0; i < data.length; i++){
            var img = tool.createDom('img'),
                attrVal = {};
            attrVal = data[i].isTarg ? {
                'src': 'image/1_09.png',
                'draggable': false,
                'style' : 'width: ' + 100/parseInt(def.hard) + '%',
                'id': i
            }: {
                'src': 'image/1_03.png',
                'draggable': false,
                'style' : 'width: ' + 100/parseInt(def.hard) + '%',
                'id': i
            };
            tool.setAttr(img, attrVal).addClass(img, 'rotate90');
            def.content.appendChild(img);
        }
        this.flip();
    };

    proto.flip = function () {
        var _this = this, child = _this.def.content.children;
        for(i = 0; i < child.length; i++){
            setTimeout(replaceAni(i), 2000);
            setTimeout(replaceSrc(i), 2350);
        }
        function replaceAni(i) {
            return function () {
                tool.removeClass(child[i], 'rotate90').addClass(child[i], 'rotate180');
            }
        }
        function replaceSrc(i) {
            return function(){
                tool.setAttr(child[i], {'src' : 'image/1_05.png'});
                i || (_this.def.wait = false);//启动监听
            }
        }
    };

    proto.reset = function () {
        var _this = this;
        _this.def.wait = true;
        tool.cleanDom(_this.def.content);
    };
    /**
     * 游戏结束
     */
    proto.end = function () {
        this.reset();
        this.def.first = false;
        tool.html(tool.getDom('result'), this.def.score);
        tool.html(tool.getDom('best'), this.def.score);
        this.waiting();
    };
    /**
     * 点击事件处理
     * @param _this
     * @returns {Function}
     */
    ;function clickHandler(_this) {
        function hand(ev) {
            if(_this.def.wait) return;
            var e = ev || window.event;
            var t = e.target || e.srcElement;
            var id = t.id, attrVal = {};
            if (t.nodeName.toLowerCase() === 'img') {
                tool.removeClass(t, 'rotate180').addClass(t, 'rotate180_c');
                attrVal = _this.def.data[id].isTarg ? {'src': 'image/1_09.png'} : {'src': 'image/1_03.png'};
                setTimeout(function () {
                    tool.setAttr(t, attrVal);
                }, 300);
            }
            _this.score(t.id);
        };
        return hand;
    };


    // 生成随机数
    proto.getRandom = function (h) {
        var a = [];
        var arr = Object.keys(String( Array( h * h + 1)))
            .map( function(e, i){ return i})
            .sort(function () { return 0.5 - Math.random()})
            .slice(0, h)
            .toString();
        // arr = arr.sort(function () { return 0.5 - Math.random()})
        //     .slice(0, h).toString();
        for (i = 0; i < h * h; i++){
            a.push({
                id: i,
                isTarg: !!arr.match(new RegExp('(^|,)' + i + '(,|$)')),
            });
        }
        return a;
    };
    return GameManager;
});
/**
 * 工具管理对象
 */
var tool = {
    getDom : function () {
        return document.getElementById(arguments[0]);
    },
    createDom: function () {
        return document.createElement(arguments[0]);
    },
    cleanDom: function (ele) {
        while (ele.hasChildNodes()){
            ele.removeChild(ele.lastChild)
        }
    },
    removeDom: function (ele, l) {
        ele.removeChild(ele.children[l]);
    },
    setAttr: function (ele, targ) {
        //targ 为键值对参数，可以同时设置多个参数
        //示例：{ 'id' : '1', 'class': 'xx xx'}
        for (var i in targ){
            ele.setAttribute(i, targ[i]);
        }
        return this;
    },
    html: function () {
        //传入两条参数修改文本 一条参数获取文本
        return arguments[1] ? ( arguments[0].innerHTML = arguments[1]) : arguments[0].innerHTML;
    },
    hasClass: function (ele, targ) {
        return new RegExp('(^|\\s)'+ targ + '(\\s|$)').test(ele.className);
    },
    addClass: function (ele, targ) {
        this.hasClass(ele, targ) || (ele.className +=  ' ' + targ);
        return this;
    },
    removeClass: function (ele, targ) {
        if(this.hasClass(ele, targ)) {
            ele.className = ele.className.replace(new RegExp('(^|\\s)' + targ + '(\\s|$)'), '');
        }
        return this;
    },
    addAnimation: function (ele, targ) {
        ele.style.animation = targ;
        ele.style.webkitAnimation = targ;
    },
    addEvent: function (ele, type, fn, cap) {//cap是否冒泡
        if (ele.addEventListener){
            ele.addEventListener(type, fn, cap || false);
        }else if (ele.attachEvent){
            ele.attachEvent('on' + type, fn);
        }
    },
    removeEvent: function (ele, type, fn) {
        if( ele.removeEventListener) {
            ele.removeEventListener(type, fn, false);
        }else if (ele.detachEvent){
            ele.detachEvent('on' + type, fn);
        }
    },
    delay: function (fn, t) {
        setTimeout(fn, t);
    },
};

new GameManager();