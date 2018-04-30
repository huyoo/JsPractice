
require.config({
    paths: {
        'jquery': '../../static/jquery.min'
    }
});
require(["selectField"], function (SelectField) {
    var data = {
        type: "create", //获取路径，为null/create时直接生成, post/get 从后台获取数据
        prams: {// 直接升成时作为选项键值对, 从后台获取数据时作为查询参数
            id: "1",
            val: "2",
        },
    };

    var select = SelectField.init(data);
    select.show();
});