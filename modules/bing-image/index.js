const fs = require('fs');
const path = require('path');
const axios = require('axios');
let getEnddate = mediaContent => {
    if (!mediaContent.enddate && mediaContent.FullDateString) {
        let enddate = mediaContent.FullDateString.replace('月', '').split(' ');
        mediaContent.enddate = enddate[0] + (enddate[1] < 9 ? '0' : '') + enddate[1] + (enddate[2] < 9 ? '0' : '') + enddate[2];
    }
    return mediaContent.enddate;
}

let getFilePath = (enddate, fileType) => {
    let filePath = './docs/' + enddate.substring(0, 4) + (fileType === '.jpg' ? '/' + enddate.substring(0, 6) : '');
    try {
        fs.mkdirSync(filePath, {recursive: true});
    } catch (e) {
    }
    return filePath + '/' + (fileType === '.jpg' ? enddate : enddate.substring(0, 6)) + fileType;
}

let getMediaContents = (filePath) => {
    let mediaContents;
    try {
        mediaContents = fs.readFileSync(filePath, {encoding: 'utf-8'});
        mediaContents = JSON.parse(mediaContents);
    } catch (e) {
        // console.error(e);
        mediaContents = [];
    }
    return mediaContents;
}

let updateJSONFile = mediaContents => {
    if (mediaContents && Array.isArray(mediaContents) && mediaContents.length > 0) {
        let MediaContentsCache = new Map;
        mediaContents.forEach(mediaContent => {
            let enddate = getEnddate(mediaContent);
            let jsonFile = getFilePath(enddate, '.json',);
            let mediaContents = MediaContentsCache.get(jsonFile);
            if (!mediaContents) {
                mediaContents = getMediaContents(jsonFile);
                MediaContentsCache.set(jsonFile, mediaContents);
            }
            mediaContents.push(mediaContent);
        });
        MediaContentsCache.forEach((fileContent, filePath) => {
            let keySet = new Set();
            let jsonStr = '[\r\n';
            fileContent.sort((a, b) => {
                return getEnddate(a) > getEnddate(b) ? 1 : -1;
            }).forEach(mediaContent => {
                if (!keySet.has(getEnddate(mediaContent))) {
                    jsonStr += JSON.stringify(mediaContent) + ',\r\n';
                    keySet.add(getEnddate(mediaContent));
                }
            });
            jsonStr = (jsonStr + ']').replace('},\r\n]', '}\r\n]');
            try {
                fs.writeFileSync(filePath, jsonStr, null);
                updateMDFile(JSON.parse(jsonStr), filePath.replace('.json', '.md'));
            } catch (e) {
                console.error(e);
            }
        })
    }
}


let addHost = url => {
    let result = url;
    if (!result.startsWith("http")) {
        result = 'https://cn.bing.com' + result;
    }
    return result;
}

let updateMDFile = (mediaContents, filePath) => {
    let fileName = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.'));
    let content = `## 必应今日图片(${fileName === 'README' ? '最近7天' : fileName})`;
    mediaContents.forEach((mediaContent) => {
        content += `
### ${mediaContent.FullDateString}：${mediaContent.ImageContent.Headline}
#### ${mediaContent.ImageContent.Title}（${mediaContent.ImageContent.Copyright}）

![${mediaContent.ImageContent.Headline}](${addHost(mediaContent.ImageContent.Image.Wallpaper.replaceAll('1920x1200', '800x480'))} "${mediaContent.ImageContent.Headline}")

${mediaContent.ImageContent.Description}

${mediaContent.ImageContent.QuickFact.MainText}

[Bing搜索](${addHost(mediaContent.ImageContent.BackstageUrl)} "必应今日图片 ${mediaContent.FullDateString}")
[必应主页测验](${addHost(mediaContent.ImageContent.TriviaUrl)} "必应主页测验 ${mediaContent.FullDateString}")
[下载480](${addHost(mediaContent.ImageContent.Image.Wallpaper.replaceAll('1920x1200', '800x480'))} "${mediaContent.ImageContent.Title}")
[下载720](${addHost(mediaContent.ImageContent.Image.Wallpaper.replaceAll('1920x1200', '1024x768'))} "${mediaContent.ImageContent.Title}")
[下载1080](${addHost(mediaContent.ImageContent.Image.Wallpaper.replaceAll('1920x1200', '1920x1080'))} "${mediaContent.ImageContent.Title}")
[下载UHD](${addHost(mediaContent.ImageContent.Image.Wallpaper.replaceAll('1920x1200', 'UHD'))} "${mediaContent.ImageContent.Title}")

---`;
    });

    try {
        fs.writeFileSync(filePath, content, null);
    } catch (e) {
        console.error(e);
    }
}
exports.getFilePath = getFilePath;
exports.getMediaContents = getMediaContents;
exports.updateJSONFile = updateJSONFile;
exports.updateMDFile = updateMDFile;

exports.downloadImage = (startDate, endDate) => {
    startDate = new Date(startDate || '2020/1/1');
    endDate = new Date(endDate || new Date());
    while (startDate < endDate) {
        let enddate = startDate.getFullYear() + (startDate.getMonth() < 9 ? '0' : '') + (startDate.getMonth() + 1) + (startDate.getDate() < 10 ? '0' : '') + startDate.getDate();
        let jsonFilePath = getFilePath(enddate, '.json');
        let mediaContents = getMediaContents(jsonFilePath);
        if (mediaContents && mediaContents.length > 0) {
            Array.from(mediaContents, mediaContent => {
                let url = addHost(mediaContent.ImageContent.Image.Wallpaper.replaceAll('1920x1200', 'UHD'));
                axios.get(url, {responseType: 'stream'})
                    .then(response => {
                        response.data.pipe(fs.createWriteStream(path.resolve(getFilePath(mediaContent.enddate, '.jpg'))));
                    }).catch(console.error);
            })
        }
        startDate.setMonth(startDate.getMonth() + 1);
    }
}

exports.updateMD = (startDate, endDate) => {
    startDate = new Date(startDate || '2020/1/1');
    endDate = new Date(endDate || new Date());
    while (startDate < endDate) {
        let enddate = startDate.getFullYear() + (startDate.getMonth() < 9 ? '0' : '') + (startDate.getMonth() + 1) + (startDate.getDate() < 10 ? '0' : '') + startDate.getDate();
        let jsonFilePath = getFilePath(enddate, '.json');
        let mdFilePath = getFilePath(enddate, '.md');
        let mediaContents = getMediaContents(jsonFilePath);
        if (mediaContents && mediaContents.length > 0) {
            updateMDFile(mediaContents, mdFilePath);
        }
        startDate.setMonth(startDate.getMonth() + 1);
    }
}

exports.loadBingTodayImage = () => {
    console.log(`开始时间：${new Date().toUTCString()}`);
    fetch(addHost('/hp/api/model'))
        .then(response => {
            response.json()
                .then(json => {
                    if (json.MediaContents) {
                        updateJSONFile(json.MediaContents);
                        updateMDFile(json.MediaContents, './docs/README.md');
                        // fs.copyFileSync('./docs/README.md', './README.md')
                        console.log(`结束时间：${new Date().toUTCString()}`);
                    } else {
                        console.error(json);
                    }
                })
                .catch(console.error);
        })
        .catch(console.error);
}