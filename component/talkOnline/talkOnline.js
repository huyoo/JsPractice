/**
 * @desc: 在线洽谈
 * @author: yu.hu
 * @date: 2018/8/1 11:20
 */
(function () {
    var ENT_ID = "2574A425-5719-11E8-9C89-F83441FC5B61", //登录模拟用户
        BANK_ID = "",
        options = {
            currentPage: null,
            total: null,
            keyWord: null,//查询关键字
            pageSize: 15, //历史消息单页显示消息量
            dateTips: 120000, //聊天内容时间提示间隔两分钟
            getNewMsgInterval: 10000,//获取新消息时间间隔10秒钟
            type: "1" //登录用户身份 企业1 银行0
        },
        msgArr = [];

    //----------------------  工具包 + 异步通信管理  ----------------------------
    var util = {
        // 登录用户为企业时 type为1的消息都是对方发送
        checkType: function (type) {
            return type === options.type ? "him": "mine";
        },
        //检查消息是否距离上一条消息超过两分钟
        checkTime: function (mgsDate, lastDate) {
            mgsDate = new Date(mgsDate);
            lastDate  = new Date(lastDate);
            if (!mgsDate instanceof Date || !mgsDate instanceof Date) {
                throw "arguments is not Date";
            }
            return (mgsDate - lastDate) > options.dateTips;
        },
        //时间格式转换
        format: function (time, format) {
            var t = time instanceof Date? time: new Date(time);
            format = format || "yyyy-MM-dd HH:mm";
            var tf = function (i) {
                return (i < 10 ? '0' : '') + i
            };
            return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
                switch (a) {
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
        
        // 获取未读消息
        showNotReadMsg: function (bankId, entId) {
            $.ajax({
                url: SERVRT_HOST + "/talkOnline/getNotReadMsg",
                data: {
                    bankId: bankId,
                    entId: entId,
                    type: options.type
                },
                success: function (re) {
                    // !!!获取到的数据以时间倒序排列
                    if(!re || re.length === 0 || re[0].bankId !== BANK_ID) return;

                    var html = util.createMsgDom(re, false);
                    $(".new_msg > .content").append(html);
                    newMsg.toBottom();
                }
            })
        },

        //提示新消息
        addNotReadTips: function () {
            var that = this, id = ENT_ID;
            if(!id) return;

            $.ajax({
                url: SERVRT_HOST + "/talkOnline/getNotReadMsgCount",
                data: {
                    id: id,
                    type: options.type
                },
                success: function (re) {
                    for(var i in re){
                        var obj = re[i];
                        if(+obj.state === 0) continue;

                        $(".ent_list div[data-title ='"+obj.bankId +"']").find("span:eq(-1)").addClass("red_dot");
                    }
                    if(re.length > 0 && re[0].bankId === BANK_ID && +re[0].state){
                        $(".ent_list div[data-title ='"+ BANK_ID +"']").find("span:eq(-1)").removeClass("red_dot");
                        util.showNotReadMsg(BANK_ID, ENT_ID);
                    }
                }
            });
            return true;
        },

        // 发送消息
        send: function (content) {
            //发送操作
            var html = '', msg = {
                type: options.type === "1"? "0": "1",
                content: content,
                createdDate: new Date(),
            };

            if(!BANK_ID) return;

            $.ajax({
                url: SERVRT_HOST + "/talkOnline/save",
                data: {
                    bankId: BANK_ID,
                    entId: ENT_ID,
                    type: options.type === "1"? "0": "1",
                    content: content
                },
                success: function () {
                    if(msgArr.length > 0 && util.checkTime(msg.createdDate, msgArr[msgArr.length - 1].createdDate)) {
                        html = "<div class='date'><span>" + util.format(msg.createdDate) + "</span></div>";
                    }
                    html += "<div class='mine'><p>" + msg.content + "</p></div>";
                    $(".new_msg > .content").append(html);
                    msgArr.push(msg);

                    newMsg.toBottom();
                },
                error: function () {
                    html = "<div class='mine'><span class='btn_warn btn' title='消息发送失败,点击重新发送'>!</span><p>" + msg.content + "</p></div>";
                    $(".new_msg > .content").append(html);
                    newMsg.toBottom();
                    handler.bind(".btn_warn", "click");
                }
            });
        },

        // 获取联系过的用户
        showLinked: function (id) {
            $.ajax({
                type: "get",
                url: SERVRT_HOST + "/talkOnline/getLinked",
                data: {
                    id: id,
                    type: "entId"
                },
                success: function (re) {
                    if(!re) return;

                    var html = "", h;
                    re.forEach(function (obj) {
                        h = "<span class='name' data-title='"+ obj.bankName +"'>" +obj.bankName+"</span><span></span>";
                        html += "<div data-title='"+ obj.bankId +"' title='"+ obj.bankName +"'>"+ h+ "</div>";
                    });
                    $(".ent_list > .content").html(html);
                }
            })
        },

        // 分页获取历史消息
        showHistory: function (bankId, entId, currentPage, pageSize, keyWord) {
            if(!bankId || !entId) return;

            $.ajax({
                url: SERVRT_HOST + "/talkOnline/getHistory",
                data: {
                    bankId: bankId,
                    entId: entId,
                    currentPage: currentPage || 1,
                    pageSize: pageSize,
                    keyWord: keyWord || null
                },
                success: function (re) {
                    $(".history .content").html(util.createMsgDom(re.rows, true));
                    options.total = +re.total;
                    options.currentPage = +re.page;

                    if(options.total <= 1){
                        $(".btn_last, .btn_lastest, .btn_next, .btn_latest").addClass("btn_disabled");
                    }else {
                        if(options.currentPage === 1){
                            console.log(options.total);
                            $(".btn_next, .btn_latest").addClass("btn_disabled");
                            $(".btn_last, .btn_lastest").removeClass("btn_disabled");
                        }else if(options.total === options.currentPage){
                            $(".btn_last, .btn_lastest").addClass("btn_disabled");
                            $(".btn_next, .btn_latest").removeClass("btn_disabled");
                        } else {
                            $(".btn_last, .btn_lastest, .btn_next, .btn_latest").removeClass("btn_disabled");
                        }
                    }

                    historyMsg.toBottom();
                }
            })
        },
        // 发送消息dom生成
        createMsgDom: function (arr, isHistory) {
            var html = "", messageArr = [];

            if(isHistory){
                messageArr = [];
            }else {
                messageArr = msgArr;
            }

            for(var i = arr.length - 1; i >= 0; i--) {
                var obj = arr[i];

                if (!messageArr.length || util.checkTime(obj.createdDate, messageArr[messageArr.length - 1].createdDate)) {
                    //当前没有消息缓存时,生成时间提示
                    // 或者 距离上次消息超过两分钟时提示时间
                    html += "<div class='date'><span>" + util.format(obj.createdDate) + "</span></div>";
                }

                html += "<div class='" + util.checkType(obj.type)+ "'><p>" + obj.content + "</p></div>";
                //缓存消息
                messageArr.push(obj);
            };
            return html;
        },
    };

    //------------------------ 事件处理  -----------------------------------
    var handler = {
        handleEvent: function (ev) {
            var that = this,
                className;

            className = $(ev.target).attr("class").split(/\s/);
            className.forEach(function (i) {
                switch (i) {
                    case "btn_history":
                        that._history(ev);
                        break;
                    case "btn_close":
                        that._close(ev);
                        break;
                    case "btn_submit":
                        that._submit(ev);
                        break;
                    case "input_area":
                        that._submit(ev);
                        break;
                    case "btn_search":
                        that._searchShow(ev);
                        break;
                    case "btn_latest":
                        that._toFirstPage(ev);
                        break;
                    case "btn_next":
                        that._lastPage(ev);
                        break;
                    case "btn_last":
                        that._nextPage(ev);
                        break;
                    case "btn_lastest":
                        that._toLastPage(ev);
                        break;
                    case "btn_warn":
                        that._warnHandle(ev);
                        break;
                    case "btn_calendar":
                        that._calendar(ev);
                        break;
                }
            });
        },
        _history: function (ev) {
            var className = $(".now").attr("class");
            if (className.indexOf("full_view") >= 0) {
                $(".now").removeClass("full_view").addClass("half_view");
                $(".history").removeClass("hide");
                historyMsg.toBottom();
                util.showHistory(BANK_ID, ENT_ID, 1, options.pageSize);
            } else {
                $(".now").removeClass("half_view").addClass("full_view");
                $(".history").addClass("hide");
                options.keyWord = null;
                $(".btn_calendar").html("");
                $("#schedule-box").css("display","none");
            }
        },
        _close: function (ev) {
            $(".now").removeClass("half_view").addClass("full_view");
            $(".history").addClass("hide");
            options.keyWord = null;
            $(".btn_calendar").html("");
            $("#schedule-box").css("display","none");
        },
        _submit: function (ev) {
            var val = $("textarea").val();
            if (ev.keyCode != 13 && ev.type !== "click")
                return;
            if (!val.length || /^(\n|\s)*$/.test(val))
                return "信息为空,不能发送!"

            val = val.replace(/\s/g, "&nbsp;");
            if (val.length > 200)
                return "输入信息过长";

            util.send(val);
            $("textarea").val("");
        },
        _searchShow: function (ev) {
            var that = this;

            var t = $(ev.target);
            t.parent().children().map(function (i) {
                t.parent().children(i).hide();
            });
            $(".search_box").removeClass("hide").attr("style", "");
        },
        _toFirstPage: function () {
            // 获取最新的一页消息
            var total = options.total, pageSize = options.pageSize;
            if(!total ||  total === 1) return;
            util.showHistory(BANK_ID, ENT_ID, 1, pageSize, options.keyWord);
        },
        _lastPage: function () {
            // 获取较新的一页消息
            var page,
                total = options.total,
                pageSize = options.pageSize,
                currentPage = options.currentPage;

            if(!total || total === 1) return;
            page = (currentPage-1)<1 ? 1 : (currentPage-1);
            util.showHistory(BANK_ID, ENT_ID, page, pageSize, options.keyWord);
        },
        _nextPage: function () {
            // 获取较早的一页消息
            var page,
                total = options.total,
                pageSize = options.pageSize,
                currentPage = options.currentPage;

            if(!total || total === 1) return;
            page = (currentPage+1)>total ? total : (currentPage+1);
            util.showHistory(BANK_ID, ENT_ID, page, pageSize, options.keyWord);
        },
        _toLastPage: function () {
            var total = options.total,
                pageSize = options.pageSize;

            //获取最早的一页消息
            if(!total || total === 1) return;
            util.showHistory(BANK_ID, ENT_ID, total, pageSize, options.keyWord);
        },
        _warnHandle: function (ev) {
            var val = $(ev.target).next().html();
            $(ev.target).parent().remove();
            util.send(val);
        },
        _calendar: function (ev) {
            var t = $(ev.target);

            if($("#schedule-box").css("display").indexOf("block") === -1){
                var top = t.offset().top - 230 + "px",
                    left = t.offset().left - 180;

                $("#schedule-box").css({"left":left,"top":top,"display":"block"});
                var mySchedule = new Schedule({
                    el: '#schedule-box', //指定包裹元素（可选）
                    clickCb: function(y, m, d) {
                        t.html(y + '-'+ m +'-'+ d);
                        $("#schedule-box").css({"display":"none"});
                        options.keyWord = y + '-'+ ((m+"").length === 1? ("0"+m): m) +'-'+ (d.length === 1? ("0"+d): d);
                        util.showHistory(BANK_ID, ENT_ID, 1, options.pageSize, options.keyWord);
                    }
                });
            } else {
                $("#schedule-box").css("display","none");
            }
        },
        bind: function () {
            var that = this;

            if (arguments.length === 1) {
                if (typeof arguments[0] != "object") {
                    throw "arguments is error"
                }
                var obj = arguments[0];
                for (var ele in obj) {
                    $(ele)[0].addEventListener(obj[ele], that, false);
                }
            } else {
                $(arguments[0])[0].addEventListener(arguments[1], that, !!arguments[2]);
            }
        }
    };

    // 选中联系人
    $(".ent_list .content").on("click", function (ev)  {
        ev.stopPropagation();
        ev.preventDefault();

        var t, name;
        if (ev.target.nodeName == "DIV") {
            t = $(ev.target).find(".name");
        } else {
            t = $(ev.target);
        }

        //界面调整
        name = t.attr("data-title");
        $("span[data-title='entName']").html(name);
        $(".ent_list .content> div").removeClass("bg_blue");
        t.parent().addClass("bg_blue");
        t.next().removeClass("red_dot");  //移除提示新消息的红点

        $(".history").addClass("hide")    //隐藏历史消息界面
            .find(".content").html("");
        $(".new_msg >.content").html("")  //调增新消息界面
            .next().addClass("hide");
        $(".now").addClass("full_view").removeClass("half_view");

        //参数获取,分页数据重置
        BANK_ID = t.parent().attr("data-title");
        total = 0; currentPage = 0;
        msgArr = [];
        newMsg.toTop();

        util.showNotReadMsg(BANK_ID, ENT_ID);
    });

    // 搜索消息
    $(".search_box > span").on("click", function () {
        $(".search_box").parent().children().attr("style", "");
        $(".search_box").addClass("hide");
        var val = $(".search_input").val();
        if(!val){
            return;
        }
        options.keyWord = val;
        util.showHistory(BANK_ID, ENT_ID, 1, options.pageSize, val);
    });

    // -------------------------- 消息轮询 ---------------------------------------
    var loop = {
        isLoop: true,
        symbols: null,
        stop: function () {
            this.isLoop = false;
        },
        setSymbol: function () {
            var date = new Date();
            this.symbols = "" + date.getHours() + date.getMinutes()+ date.getSeconds() + date.getMilliseconds();
            localStorage.setItem("talkOnlineSymbol", this.symbols);
        },
        start: function () {
            var symbols = localStorage.getItem("talkOnlineSymbol");

            if(loop.isLoop || symbols === loop.symbols) {
                if(util.addNotReadTips())
                    loop.isLoop = true;
            }

            setTimeout(loop.start, options.getNewMsgInterval);
            loop.isLoop = false;
        },

    };

    // --------------------------  函数启动  -------------------------------------
    // 消息内容滚动初始化
    var newMsg = new Scroll({ele: ".new_msg"}),
        historyMsg = new Scroll({ele: ".history_msg"}),
        entList = new Scroll({ele: ".ent_list"});

    //加载联系人
    util.showLinked(ENT_ID);
    util.addNotReadTips();

    // 聊天界面 按钮事件绑定
    handler.bind({
        ".btn_history": "click", //展示关闭历史聊天
        ".btn_close": "click",   //关闭历史聊天
        ".btn_submit": "click",  //发送消息
        ".input_area": "keyup",  //回车发送消息
        ".btn_search": "click",  //开启搜索输入框
        ".btn_lastest": "click", //最早的一页消息, 逻辑上数据按照创建时间倒序输出，因此最早的一页对应末页消息
        ".btn_last": "click",    //上一页
        ".btn_next": "click",    //下一页 
        ".btn_latest": "click",  //最新的一页消息, 逻辑上是首页
        ".btn_calendar": "click" //时间搜索
    });

    //本地存储 存放页面标识
    loop.setSymbol();
    loop.start();
})();