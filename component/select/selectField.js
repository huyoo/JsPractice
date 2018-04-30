/**
 * 下拉选择框
 */
define(["jquery"], function ($) {
    var arr = [];
    var SelectField = function(opt){
        this.type = opt.type;
        this.prams = opt.prams;

        this.id = opt.id ? "#" + opt.id : ".select_field";
        this.addEvent();
    };

    var proto = SelectField.prototype;
    //显示调用
    proto.show = function(){
        var _this = this,
            type = _this.type;
        $(_this.id).find('input').on("click", function(ev){
            ev.stopPropagation();
            if( !type || type === "create" ){
                _this.init();
            } else if(type === "post" || type === "get"){
                _this.ajax();
            } else{
                throw "type is not in create/post/get";
            }
        });
    };
    //dom生成
    proto.init = function(){
        var _this = this,
            content = $(_this.id).children().children().eq(-1),
            prams = _this.prams;
        if(content.css("display") === "block")
            return;
        arr.length = 0;
        for(var i in prams){
            arr.push(i);
            content.append("<span>" + prams[i] + "</span>");
        }
        content.css("display", "block");
    };
    //后台获取参数
    proto.ajax = function (){
        var _this = this;
        $.ajax({
            type: _this.type,
            url: "select/data.json",
            data: _this.prams,
            dataType: "json",
            async: false,
            success: function(data){
                _this.prams = data[0];
                _this.init();
            },
            error: function(){
                throw "获取数据失败,请重试";
            }
        });
    };
    // 添加事件
    proto.addEvent = function () {
        var _this = this,
            content = $(_this.id).find("div").eq(-1);

        content.on("click", selectHandler);
        $(document).on("click", listHide);
        
        function listHide() {
            content.attr("style", "").children().remove();
        }

        function selectHandler(ev){
            ev.stopPropagation();
            var i = $(this).children().index(ev.target);
            $(this).parent()
                .find("input")
                .attr("data-select", arr[i])
                .val(_this.prams[arr[i]]);
            $(this).attr("style", "")
                .children()
                .remove();
        }
    };

    return function(){
        return new SelectField(arguments[0]);
    }
});