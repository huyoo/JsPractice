/**
 * @desc: EUI 扩展组件
 * @author: yu.hu
 * @date: 2018/5/17 20:05
 */

/**
 * 统计表单-融资统计
 * @returns {*}
 * @constructor
 */
EUI.ColumnForm = function () {
    return new EUI.container.ColumnForm(arguments[0]);
};
EUI.container.ColumnForm = EUI.extend(EUI.container.FormPanel, {
    initComponent : function() {
        EUI.container.ColumnForm.superclass.initComponent.call(this);
    },
    getType: function () {
        return "ColumnForm";
    },
    render: function () {
        var g = this;
        EUI.container.ColumnForm.superclass.render.call(this);
        g.dom.addClass(g.domCss);

        g.setHeight();
        g.setWidth();
    },
    addItems: function (items) {
        var g = this;

        if (!items){
            return;
        }
        g.options.items = [];

        for(var i = 0;i < items.length; i++){
            var item = items[i];
            EUI.applyIf(item, g.defaultConfig);
            EUI.applyIf(item, g.defaultStyle);
            g.options.items.push(item);
        }
        g.doLayout("init");

    },
    clean: function () {
        var g = this, dom;

        if(!g.items){
            return;
        }
        g.options.items = [];
        g.items.map(function (item) {
            dom = $(EUI.getCmp(item).dom[0]).parent();
            EUI.getCmp(item).remove();
            if(dom.attr("class").indexOf("ux-line-row") !== -1){
                dom.remove();
            }
        });
        g.items = [];
    },
    getFormValue: function () {
        var items = this.items, data;
        data = [];

        for (var i = 0; i < items.length; i++) {
            var item = EUI.getCmp(items[i]);
            var a = this.getItemValue(item);
            for(var s in a){
                data.push(a[s]);
            }
        }
        return data;
    },
});

/**
 * 统计数据展示容器-融资统计
 * @returns {*}
 * @constructor
 */
EUI.ColumnText= function () {
    return new EUI.other.ColumnText(arguments[0]);
};
EUI.other.ColumnText = EUI.extend(EUI.UIComponent, {
    name: null,
    title: null,//显示标题
    value: null,
    unit: "家",
    domCss: "rz_line",
    labelCss: "rz_line_label",
    unitCss: "rz_line_unit",
    dataCss: "rz_line_data", //数据样式
    labelWidth: null, //标题宽度
    dataWidth: null, //显示数据宽度

    initComponent : function() {
        EUI.other.ColumnText.superclass.initComponent.call(this);
    },
    getType: function () {
        return "ColumnText";
    },
    render: function () {
        var g = this;
        g.dom.addClass(g.domCss);
        g.initLabel();
        g.initValue();
    },
    setValue: function (value) {
        if (value && typeof value == "string"){
            value = value.trim();
        }
        this.dom.field.val(value);
        this.value = value;
    },
    initLabel: function () {
        var g = this;

        if(!g.title){
            return;
        }
        var title = "<span>"+ g.title +"</span><span>:</span>";
        var label = $("<div>"+ title +"</div>");
        label.addClass(g.labelCss);
        g.labelWidth && label.css("width", g.labelWidth);
        this.labelStyle && label.css(this.labelStyle);
        g.dom.label = label;
        g.dom.append(label);
    },
    initValue: function () {
        var g = this, value, data;

        value = "<span class='"+ g.dataCss+"'>"+ g.value +"</span>";
        data = $("<div>"+ value +"</div>");
        g.dataWidth && data.find("." + g.dataCss).css("width", g.dataWidth + "px");

        g.unit && data.append("<span class = '"+ g.unitCss +"'>"+ g.unit +"</span>");
        data.addClass(g.labelCss);
        g.dom.append(data);
    },
});

/**
 * 统计数据编辑文本框-融资统计
 * @returns {*}
 * @constructor
 */
EUI.ColumnField = function () {
    return new EUI.form.ColumnField(arguments[0]);
};
EUI.form.ColumnField = EUI.extend(EUI.form.Field, {
    inputType: 'number',
    width: 220,
    height: 20,
    minlength: 0,
    maxlength: Number.MAX_VALUE,
    allowChar: null,
    allowBlank: true,
    checkCss: "rz_field_check",
    unit: "家",
    selectOk: "确认",
    selectChange: "调剂",
    domCss: "rz_field",
    labelCss: "rz_field_label",
    selectCss: "rz_field_select",
    inputCss: "rz_field_input",
    unitCss: "rz_field_unit",
    selectItem: null,
    inputItem: null,
    lockValue: "0",// 输入框联动值
    lock: true,// 是否开启锁定联动
    initComponent: function () {
        EUI.form.ColumnField.superclass.initComponent.call(this);
    },
    getType: function () {
        return 'ColumnField';
    },
    render: function () {
        var g = this;
        g.dom.addClass(g.domCss);
        g.initSelect();
        g.initLabel();
        g.initField();
        g.setValue();
        g.selectEvent();
    },
    initSelect: function () {
        var g = this, dom, item, html;
        if(!g.selectItem)
            return;
        g.dom.select = [];

        for (var i = 0; i < g.selectItem.length; i++){
            if(!(item = g.selectItem[i])){
                console.error(item + " error");
                continue;
            }
            dom = $("<div class='"+ g.labelCss +"'></div>");
            dom.append("<span>"+ item.title +"</span>");

            html = $("<input type='radio' name='"+ item.name +"' value='"+ item.value +"' style='display: none'>");
            dom.field = html;
            dom.value = item.value;
            dom.append(html);

            html = $("<span class='"+ g.selectCss +"'><span></span></span>");
            dom.append(html);
            dom.fieldicon = html;
            // dom.append("<span></span>");

            g.dom.select.push(dom);
            g.dom.append(dom);
        }
    },
    initLabel: function () {
        var g = this, title, dom;
        title = "<span>"+ g.title +"</span><span>:</span>";
        dom = $("<div class='"+ g.labelCss +"'>"+ title +"</div>");

        g.inputItem.labelWidth && dom.css("width", g.inputItem.labelWidth);
        this.labelStyle && dom.css(this.labelStyle);
        g.dom.label = dom;
        g.dom.append(dom);
    },
    initField: function () {
        var g = this, dom, html;
        dom = $("<div class='"+ g.labelCss +"'><div class='"+ g.inputCss + "'></div></div>");
        html = $("<input type='"+ g.inputType +"' class='"+ g.inputCss+"'>");
        dom.children(0).append(html);
        if(g.dataWidth){
            dom.find("." + g.inputCss)
                .css("width", g.dataWidth + "px");
        }
        g.unit && dom.append("<span class = '"+ g.unitCss +"'>"+ g.unit +"</span>");
        g.dom.field = html;
        g.dom.append(dom);
    },
    selectEvent: function () {
        var g = this;
        g.dom.select.forEach(function(s) {

            s.fieldicon.bind("click", function() {

                for(var i = 0; i < g.dom.select.length; i++){
                    if(s.value === g.dom.select[i].value){
                        g.setSelectValue(true, i);
                    }else{
                        g.setSelectValue(false, i);
                    }
                }
                s.value === g.lockValue ? g.lockInput(true) : g.lockInput(false);
            });
        });
    },
    lockInput: function (v) {
        var g = this;

        if(!g.lock){
            return;
        }
        if (v){
            g.dom.field.parent().addClass("rz_field_readonly");
            g.dom.field.attr('readonly', "readonly");
            g.dom.field.val(g.value);
        }else {
            g.dom.field.parent().removeClass("rz_field_readonly");
            g.dom.field.removeAttr("readonly")
        }
    },
    // 获取组件参数 待修改
    getValue: function () {
        var g = this, data = {};

        var value = this.dom.field.val();
        if (value) {
            data.value = value.trim();
        }
        data.id = g.name;
        data.regionid = g.regionId;
        g.dom.select.forEach(function (item) {
            if (!item.checked){
                return;
            }
            data[$(item.field).attr("name")] = item.value;
        });
        return data;
    },
    setSelectValue: function (v, i) {
        var g = this, s;

        if(v !== false && !v){
            return;
        }
        s = g.dom.select;
        if(v){
            s[i].field.attr("checked", true);
            s[i].fieldicon.children(0).addClass("checked");
            s[i].checked = true;
        }else {
            s[i].field.attr("checked", false);
            s[i].fieldicon.children(0).removeClass("checked");
            s[i].checked = false;
        }
    },
    setValue: function () {
        var g = this, item;

        for (var i = 0; i < g.selectItem.length; i++) {
            item = g.selectItem[i];
            if (g.label == item.value) {
                g.setSelectValue(true, i);
                g.label == g.lockValue && g.lockInput(true);

            } else {
                g.setSelectValue(false, i);
            }

        }
        g.dom.field.val(g.value);
    },
    setHeight: function () {
        
    },
});

/**
 * 融资信息-融资超时预警
 * @returns {*}
 * @constructor
 */
EUI.FinanceInfo = function () {
    return new EUI.container.FinanceInfo(arguments[0]);
};
EUI.container.FinanceInfo = EUI.extend(EUI.container.Container, {
    infoCss: "finance_info",
    initComponent : function() {
        EUI.container.FinanceInfo.superclass.initComponent.call(this);
    },
    getType: function () {
        return "FinanceInfo";
    },
    render: function () {
        var g = this;
        EUI.container.FinanceInfo.superclass.render.call(this);
        g.dom.addClass(g.domCss);

        g.setHeight();
        g.setWidth();
    },
    addItems: function () {
        var g = this, dom, content, container;
        container = $("<div class = "+ g.infoCss +"></div>");

        //根据页面配置的item生成dom
        g.options.items.forEach(function (item) {
            dom = $("<div></div>");

            //区分分割线
            if (item === "split") {
                dom.addClass("split_line");
                container.append(dom);
                return;
            }

            dom.addClass(item.css);
            content = $("<div>"+ item.title +"</div>");
            dom.append(content);
            content = $("<div class = 'data' data-title = '"+item.name +"'></div>");
            item.style && content.css(item.style);

            //根据item样式决定数据dom是在说明文字的前面还是后面
            if(item.css === 'overlapping'){
                dom.children().before(content);
            }else if(item.css === 'inline'){
                dom.append(content);
            }else {
                dom.append(content);
            }
            container.append(dom);
        });
        g.content.append(container);
        g.content.css("overflow", "visible");
    },
    
    setValue: function (data) {
        var g = this;
        g.options.items.forEach(function (item){
            g.dom.find("div[data-title = '"+ item.name +"']").html(data[item.name] || "---");
        })
    },
});

/**
 * 水平时间轴-融资超时预警
 * @returns {*}
 * @constructor
 */
EUI.TimelineHorizon = function () {
    return new EUI.container.TimelineHorizon(arguments[0]);
};
EUI.container.TimelineHorizon = EUI.extend(EUI.container.Container, {
    timeCss: "timeline_horizon",
    lineBaseCss: "base",
    circleCss: "circle",
    txt: "耗时:",
    initComponent : function() {
        EUI.container.TimelineHorizon.superclass.initComponent.call(this);
    },
    getType: function () {
        return "TimelineHorizon";
    },
    render: function () {
        var g = this;
        EUI.container.TimelineHorizon.superclass.render.call(this);
        g.dom.addClass(g.domCss);
        g.setHeight();
        g.setWidth();
    },
    addItems: function () {
        var g = this, type = arguments[0], items, timeline;
        if (!type){
            return;
        };

        if (type === "multi"){
            items = [{
                title: "发布",
            },{
                title: "关注",
            },{
                title: "企业选定银行",
            },{
                title: "银行确认对接",
            },{
                title: "审核",
            }, {
                title: "放款",
            }]
        } else if(type === "single"){
            items = [{
                title: "发布",
            },{
                title: "受理",
            },{
                title: "审核",
            },{
                title: "放款",
            }]
        } else {
            items = type;
        }
        timeline = g.initItem(items);
        g.dom.children(0).append(timeline);
        g.timeline = timeline;
        g.options.items = items
    },
    initItem: function (items) {
        var g = this, timeline, dom;
        var width = 100 / items.length -1 + "%";
        g.time = [];
        timeline = $("<div class='"+ g.timeCss +"'></div>");

        items.forEach(function (item, i) {
           dom = $("<div class='"+ g.lineBaseCss +"'><div></div><div></div></div>");
           dom.addClass("border_wait").width(width);
           dom.find("div").eq(0).addClass("circle bg_wait").html(i+1);

           dom.find("div").eq(-1).append("<span>"+ item.title +"</span><span data-title='date'></span>");
           g.time.push(dom);
           timeline.append(dom);
        });
        return timeline;
    },
    clean: function () {
        var g = this;
        if(!g.options.items){
            return;
        }
        g.options.items = [];
        $(g.dom).children().children().remove();
        g.time = [];
        g.timeline = null;
    },
    setValue: function (value) {
        var g = this;
        var tips = {
            pass: "✔",
            on: "✔",
            error: "×"
        };

        value.forEach(function (item, i) {
            g.time[i].removeClass("border_wait").addClass("border_"+item.state)
                .children().eq(0).removeClass("bg_wait").addClass("bg_"+item.state);
            g.time[i].find("span[data-title='date']").html(item.date);
            g.time[i].find("div.circle").html(tips[item.state]);
            if(item.expense){
                g.time[i].children().eq(1).append("<span>"+ g.txt + item.expense +"</span>");
            }
        })
    },
});

/**
 * 垂直时间轴-对接信息监测
 * @returns {*}
 * @constructor
 */
EUI.TimelineVertical = function () {
    return new EUI.container.TimelineVertical(arguments[0]);
};
EUI.container.TimelineVertical = EUI.extend(EUI.container.Container, {
    dataArr: [],//时间数组，将所有时间倒序，生成时间轴
    left: "放款：",
    right: "收款：",
    verticalCss: "timeline_vertical",//主样式
    infoCss: "info",//信息展示容器样式
    circleCss: "circle", //轴线上圆点
    lineCss: "line", //时间轴线样式
    timelineCss: "timeline",//信息面板容器
    infoHtml: null, //展示文字信息代码,需要state为left/right以外的状态
    headCss: "head",//头部样式
    headHtml: null,//头部代码
    initComponent : function() {
        EUI.container.TimelineHorizon.superclass.initComponent.call(this);
    },
    getType: function () {
        return "TimelineHorizon";
    },
    render: function () {
        var g = this;
        EUI.container.TimelineHorizon.superclass.render.call(this);
        g.dom.addClass(g.domCss);

        //container容器下生成head、时间轴和轴线三个dom
        g.dom.children().css("overflow", "inherit")
            .append("<div class='"+ g.verticalCss +"'>" +
                "<div class='"+ g.headCss +"'></div>" +
                "<div class='"+ g.timelineCss +"'></div>" +
                "<div class='"+ this.lineCss + "'></div>" +
            "</div>");

        g.headHtml && $("."+g.headCss).append(g.headHtml);//插入头部代码

        g.setHeight();
        g.setWidth();
    },
    // 生成单个时间事件
    addItem: function(item, state){
        var g =  this, index, dom, div, html;

        index = g.dataArr.indexOf(item.time);
        dom = g.dom.find("."+ g.timelineCss );
        div = $("<div class='"+ g.infoCss +"'></div>");

        if(state === "left"){
            html = "<span data-title='amount'>"+ (g[state]||"") +item.amount+"</span>" +
                "<span data-title='time'>"+ item.time.slice(0,11) + "</span>";
        } else if(state=== "right"){
            html = "<span data-title='time'>"+ item.time.slice(0,11) + "</span>" +
                "<span data-title='amount'>"+ (g[state] || "") +item.amount+"</span>";
        } else{
            html = g.infoHtml;
        }
        div.append(html);

        div = $("<div class='"+ state +"'></div>").append(div).append("<div class='"+ g.circleCss +"'></div>");
        index > 0 ? dom.children().eq(index-1).after(div) : dom.prepend(div);
        g.content = g.dom;
        g.timelineContent = dom;
    },
    //对外接口，动态添加事件
    addItems: function(data, state){
        var g = this;
        state = state || "left";
        if(!data){
            return;
        }

        data.forEach(function(item){
            //时间压栈并从大到小排序
            g.dataArr.push(item.time);
            g.dataArr.length > 1 && g.dataArr.sort(function(a, b){ return a>b ? -1 : 1});

            g.addItem(item, state);
        });
    },
    reset: function(){
        var g = this;
        g.dataArr = [];
        $(g.timelineContent).children().remove();
    },
});