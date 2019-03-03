//游戏控制
'use strict';

require.config({
    paths: {
        'jquery': 'https://cdn.bootcss.com/jquery/2.1.4/jquery.min',
        'text': '../lib/require-text'
    }
});

require(['jquery'], function () {
    console.log($("span[data-title='score']"));
});