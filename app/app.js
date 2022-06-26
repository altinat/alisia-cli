var fs = require('fs');

var link = 'https://www.bilibili.tv/th/play/1049425/11250256';
var pathname = new URL(link).pathname;
if (pathname.indexOf('/th/play/') > -1) {
    var seasonid = pathname.split('/')[3];
    var epid = pathname.split('/')[4];
    console.log(epid);
    console.log(seasonid);
} // else { var seasonid = pathname.split('/')[3]; }

//seasonurl
var seasonurl = 'https://api.bilibili.tv/intl/gateway/web/v2/ogv/play/episodes?platform=web?s_locale=th_TH&season_id=' + seasonid;
var seasontd = 'H:/AL/tmp/' + seasonid + '/';

//fecth url data
fetch(seasonurl).then(function (response) {
    return response.json();
}).then(function (data) {
    const d = data.data.sections[0].episodes;
    //loop data and output episode_id
    for (let i = 0; i < d.length; i++) {
        //get playurl files
        fetch('https://api.bilibili.tv/intl/gateway/web/playurl?device=wap&platform=web&qn=64&tf=0&type=0&ep_id=' + d[i].episode_id)
            .then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!fs.existsSync(seasontd)){
                    fs.mkdirSync(seasontd);
                }
                fs.writeFileSync(seasontd + d[i].episode_id + '.json', JSON.stringify(data));
                //get subtitle files
                fetch('https://api.bilibili.tv/intl/gateway/m/subtitle?ep_id=' + d[i].episode_id).then(function (response) {
                    return response.json();
                }).then(function (data) {
                    fs.writeFileSync(seasontd + d[i].episode_id + '-sub' + '.json', JSON.stringify(data));
                });
            });
    }
});