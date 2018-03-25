'use strict';

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
            content: tool.getDom(arguments[0]),
            menu : tool.getDom('title'),
            start : tool.getDom('start'),
            repeat: tool.getDom('repeat'),
            level: 1,
            data: null,
            score: 0,
            hard: 3,
            curtain: 0,//当前没有被找出的方块
        };
        this.waiting();
        // console.log(this);
    };

    var proto = GameManager.prototype;
    /**
     * 等待游戏开始
     */
    proto.waiting = function () {
        var _this = this;
       tool.addEvent(_this.def.start, 'click', function () {
            tool.setAttr(_this.def.start.parentNode, { 'style' : 'display: none'});
            tool.setAttr(_this.def.start.parentNode.parentNode, { 'style' : 'display: none' });
            _this.init();
        })
    };
    /**
     * 初始化游戏界面
     */
    proto.init = function () {
        var def = this.def;
        def.data = this.getRandom(def.hard);
        def.curtain = def.hard;
        this.create(def, def.data);
        def.level ===1 && this.addEvent(def);//事件委托后只生成一次监听程序
        this.score(def);
    };

    //得分管理
    proto.score = function () {
        var arg = arguments[0];
        if(!arg && arg !== 0){ return; }
        var def = this.def;
        if (typeof arg === 'object'){
            arg.data.score = 0;
            arg.data.level = 1;
        }else if (!isNaN(arg)){
             if(def.data[arg].isTarg){
                 def.score += def.hard;
                 --def.curtain;
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
            _this.remove();
        }
    };
    //创建内容
    proto.create = function (def, data) {
        for(i = 0; i < data.length; i++){
            var node = tool.createDom('div'),
                img, attrVal = {};
            for (var c = 0; c < 2; c++){
                img = tool.createDom('img');
                attrVal = !c ? { 'src' : 'image/1_05.png', 'draggable' : false }:
                    data[i].isTarg ? { 'src': 'image/1_09.png', 'draggable': false}:
                        { 'src': 'image/1_03.png', 'draggable': false};
                tool.setAttr(img, attrVal);
                node.appendChild(img);
            }
            tool.setAttr(node, {
                'style' : 'width:' + 100/parseInt(def.hard) +'%',
                'id': i
            });
            // tool.addClass(node, 'rotate360');
            def.content.appendChild(node);

        }
    };
    proto.remove = function () {
        var _this = this;
        tool.removeDom(_this.def.content);
        _this.init();
    };
    //点击事件管理
    proto.addEvent = function (data) {
        var _this = this;
        tool.addEvent(data.content, 'click', function (ev) {
            var e = ev || window.event;
            var t = e.target || e.srcElement;
            if (t.nodeName.toLowerCase() === 'img') {
                tool.addClass(t.parentNode, 'front');
                setTimeout(function(){
                   tool.setAttr(t.nextElementSibling, { 'style': 'z-index:2'});
                },350);
            }
            var id = t.parentNode.id;
            _this.score(id);
        });
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
    removeDom: function (ele) {
        while (ele.hasChildNodes()){
            ele.removeChild(ele.lastChild)
        }
    },
    setAttr: function (ele, targ) {
        //targ 为键值对参数，可以同时设置多个参数
        //示例：{ 'id' : '1', 'class': 'xx xx'}
        for (var i in targ){
            ele.setAttribute(i, targ[i]);
        }
        return ele;
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
    },
    removeClass: function (ele, targ) {
        if(this.hasClass(ele, targ)) {
            ele.className = ele.className.replace(new RegExp('(^|\\s)' + targ + '(\\s|$)'), ' ');
        }
    },
    addEvent: function (ele, type, fn, cap) {
        //cap是否冒泡
        if (ele.addEventListener){
            ele.addEventListener(type, fn, cap || false);
        }else if (ele.attachEvent){
            ele.attachEvent('on' + type, fn);
        }
    },
    removeEVent: function (ele, type, fn) {
        if( ele.removeEventListener) {
            ele.removeEventListener(type, fn, false);
        }else if (ele.detachEvent){
            ele.detachEvent('on' + type, fn);
        }
    }
};

new GameManager('content');