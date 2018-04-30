/**
 * 下拉选择框
 */
define(["jquery"], function ($) {
    var arr = [];
    var SelectField = function(opt){
        this.type = opt.type;
        this.prams = opt.prams;

        if(opt.id){
            this.id = "#" + opt.id;
            $(this.id).addClass(".select_field");
        } else{
            this.id = ".select_field";
        }
        this.select();
        this.leave();
    };

    var proto = SelectField.prototype;
    //显示调用
    proto.show = function(){
        var _this = this,
            type = _this.type;
        $(_this.id).find("input").on("click", function(target){
            target.stopPropagation();
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
            content = $(_this.id).children().eq(-1),
            prams = _this.prams;
        if(content.css("display") === "block")
            return;
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
            url: "select/aa",
            data: _this.prams,
            dataType: "json",
            async: false,
            success: function(data){
                _this.prams = JSON.stringify(data)
                _this.init();
            },
            error: function(){
                throw "获取数据失败,请重试";
            }
        });
    };
    //选中填值
    proto.select = function(){
        var _this = this,
            prams = _this.prams,
            content = $(_this.id).find("div").eq(-1);
        content.on("click", function(target){
            target.stopPropagation();
            var i = $(this).children().index(target.target);
            $(_this.id).find("input").attr("data-select", arr[i]).val(prams[arr[i]]);
            $(this).attr("style", "");
            $(this).children().remove();
        });
    };
    //点击外部隐藏下拉列表
    proto.leave = function(){
        var content = $(this.id).find("div").eq(-1);
        $(document).on("click", function(){
            content.attr("style", "").children().remove();
        })
    };

    return {
        init : function () {
            return new SelectField(arguments[0]);
        }
    }
});