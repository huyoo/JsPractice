
require.config({
    paths: {
        'jquery': '../lib/jquery.min',
        'text': '../lib/require-text'
    }
});
require(["select/selectField", "text!select/selectField.html"], function (selectField, selectTpl) {
    var data = {
        id: "cc",
        type: "post", //获取路径，为null/create时直接生成, post/get 从后台获取数据
        prams: {// 直接升成时作为选项键值对, 从后台获取数据时作为查询参数
            id: "1",
            val: "2",
        },
    };
    var data2 = {
        id: "in",
        type: "create", //获取路径，为null/create时直接生成, post/get 从后台获取数据
        prams: {// 直接升成时作为选项键值对, 从后台获取数据时作为查询参数
            id: "1",
            val: "2",
        },
    };
    var container = document.getElementsByTagName('select-field')[0];
    container.innerHTML = selectTpl;
    var s = selectField(data2);
    s.show();

    var select = selectField(data);
    select.show();
});