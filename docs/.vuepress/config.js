import {defaultTheme} from 'vuepress'

export default {
    title: '必应今日图片',
    theme: defaultTheme({
        // 默认主题配置
        navbar: (() => {
            let nav = [{
                text: '首页',
                link: '/',
            }];
            let today = new Date();
            let minDay = new Date('2020/1/1');
            let yearNav = {
                text: today.getFullYear(),
                children: []
            };
            while (today > minDay) {
                if (today.getMonth() === 11 && yearNav.children.length > 0) {
                    nav.push(yearNav);
                    yearNav = {
                        text: today.getFullYear(),
                        children: []
                    }
                }
                yearNav.children.unshift({
                    text: today.getMonth() + 1,
                    link: '/' + today.getFullYear() + '/' + today.getFullYear() + (today.getMonth() < 9 ? '0' : '') + (today.getMonth() + 1) + '.html'
                });
                today.setMonth(today.getMonth() - 1);
            }
            nav.push({
                text: '关于',
                link: '/about.html',
            }, {
                text: 'GitHub',
                link: 'https://github.com/answer-3/bing-today-image',
            })
            return nav;
        })(),
        // repo: 'answer-3/bing-today-image',
    }),
}