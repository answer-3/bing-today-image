const Bing = require('./modules/bing-image');


/**
 * 获取今日图片，并更新相应的 json 和 markdown 文件
 */
Bing.loadBingTodayImage();

/**
 * 重新 markdown 文件，markdown 模板更新后批量更新
 */
// Bing.updateMD('2020/1/1');

/**
 * 下载所有图片，图片放在本地，不提交 git
 */
// Bing.downloadImage('2023/1/1');

