'use strict';

var tool = {
    hasClass: function (e, arg) {
        return new RegExp('(^|\\s)'+ arg + '(\\s|$)').test(e.className);
    },
    addClass: function (e, arg) {
        if (!this.hasClass(e, arg)) e.className +=  ' ' + arg;
    },
    removeClass: function (e, arg) {
        e.className = e.className.replace(new RegExp('(^|\\s)' + arg + '(\\s|$)'), ' ')
    },
    css: function () {

    },
    attr: function () {

    },
};

!function () {
    var title = document.getElementById('title');
    
    function Control() {
        this.version = '1.0';
        this.def = {
            content: this.dom.byId(arguments[0]),
            level: 3,
        };
        this.init(this);

        console.log(this.def.content.className);
    };

    var proto = Control.prototype;
    
    proto.init = function () {
        var l = this.def.level,
            c = this.def.content;
        for(var i = 0; i < l*l; i++){
            var node = document.createElement('div'),
                img = document.createElement('img');
            img.src = 'image/1_05.png';
            img.draggable = false;
            node.appendChild(img);
            img = document.createElement('img');
            img.src = 'image/1_09.png';
            img.draggable = false;
            node.appendChild(img);
            node.style.width = 100/parseInt(l) + "%";
            c.appendChild(node);
        }
    };
    
    proto.dom = {
        byId : function () {
            return document.getElementById(arguments[0]);
        },
        creat: function () {
            return document.createElement(arguments[0]);
        },
        remove: function (ele) {
            while (ele.hasChildNodes()){
                ele.removeChild(ele.lastChild)
            }
        },
    };

    content.onclick = function (ev) {
        var ev = ev || window.event;
        var t = ev.target || ev.srcElement;
        if (t.nodeName.toLowerCase() === 'img') {
            t.parentNode.style.animation = 'rotate_front 1s';
            setTimeout(function(){
                t.nextElementSibling.style.zIndex = 2;
            },350);
        }
    };
    new Control('content');
}(this);





// 生成随机数组
function random(level) {
    var arr = [];
    for(var i = 0; i< level * level; i++){
        arr[i] = i;
    }
    arr = arr.sort(function () { return 0.5 - Math.random()}).slice(0, level);
    return arr;
}