#!/usr/bin/env node --no-warnings

import fs from 'fs'
import ora from 'ora';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import download from 'download';
dotenv.config();
const login_token = {
    "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,th-TH;q=0.8,th;q=0.7",
        "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "cookie": "buvid3=e4c66899-383d-4c98-9e59-301c8ceee87923976infoc; bstar-web-lang=th; SESSDATA=87359ff0%2C1671071483%2Cdd864%2A61; bili_jct=f40f399c16577260baa01d29f99054ff; DedeUserID=2094190466; DedeUserID__ckMd5=080006ae2c69fc7f; sid=iou4zqq2",
        "Referer": "https://www.bilibili.tv/th/play/36951/382071?bstar_from=bstar-web.pgc-video-detail.episode.0",
        "Referrer-Policy": "no-referrer-when-downgrade"
    },
    "body": null,
    "method": "GET"
};
const sublang = process.env.SUBLANG;

export function splitUrl(url) {
    var pathname = new URL(url).pathname;
    if (pathname.indexOf('/th/play/') > -1) {
        let seasonid = pathname.split('/')[3],
            epid = pathname.split('/')[4];
        return {
            seasonid,
            epid
        };
    } // else { var seasonid = pathname.split('/')[3]; }
    else {
        console.log('url invalid');
        process.exit();
    }
}

export function fetchseasonurl(seasonurl, seasontd) {
    const spinner = ora('Loading...').start();
    fetch(seasonurl).then(function (response) {
        return response.json();
    }).then(function (data) {
        const d = data.data.sections[0].episodes;
        if (!fs.existsSync(seasontd)) {
            fs.mkdirSync(seasontd);
        }
        fs.writeFileSync(seasontd + '/ep.json', JSON.stringify(data));
        spinner.succeed('saved ep.json');
    }).then(function () {
        const ep = JSON.parse(fs.readFileSync(seasontd + 'ep.json'));
        const d = ep.data.sections[0].episodes;
        for (let i = 0; i < d.length; i++) {
            fetch('https://api.bilibili.tv/intl/gateway/web/playurl?device=wap&platform=web&qn=64&tf=0&type=0&ep_id=' + d[i].episode_id, login_token)
                .then(function (response) {
                    return response.json();
                }).then(function (data) {
                    if (!fs.existsSync(seasontd + d[i].short_title_display)) {
                        fs.mkdirSync(seasontd + d[i].short_title_display);
                    }
                    fs.writeFileSync(seasontd + d[i].short_title_display + '/playurl-' + d[i].episode_id + '.json', JSON.stringify(data));
                });
        }
        spinner.succeed('saved playurl');
        for (let y = 0; y < d.length; y++) {
            fetch('https://api.bilibili.tv/intl/gateway/web/v2/subtitle?s_locale=th_TH&platform=web&episode_id=' + d[y].episode_id, login_token)
                .then(function (response) {
                    return response.json();
                }).then(function (data) {
                    const subdata = data.data.subtitles;
                    for (let j = 0; j < subdata.length; j++) {
                        fetch(subdata[j].url).then(function (response) {
                            return response.json();
                        }).then(function (data) {
                            if (subdata[j].lang_key == sublang) {
                                fs.writeFileSync(seasontd + d[y].short_title_display + '/subtitle.json', JSON.stringify(data))
                            }
                        }).catch(function (err) {
                            console.log(err);
                        })
                    }
                })
        }
        spinner.succeed('saved subtitle');
    }).catch(function (err) {
        console.log(err);
    })
}

export function downloadbili(seasontd) {
    //read ep.json and download video and subtitle
    fs.readFileSync(seasontd + 'ep.json', 'utf8').then(function (data) {
        console.log(data);
        const d = JSON.parse(data).data.sections[0].episodes;
        for (let i = 0; i < d.length; i++) {
            fs.readFileSync(seasontd + d[i].short_title_display + '/playurl-' + d[i].episode_id + '.json', 'utf8').then(function (data) {
                const playurl = JSON.parse(data).data.playurl;
                for (let j = 0; j < playurl.length; j++) {
                    if (playurl[j].quality == '1080p') {
                        const video_url = playurl[j].url;
                        const video_name = d[i].short_title_display + '-' + d[i].episode_id + '-' + playurl[j].quality + '.mp4';
                        const video_path = seasontd + d[i].short_title_display + '/' + video_name;
                        if (!fs.existsSync(video_path)) {
                            download(video_url, video_path);
                        }
                    }
                }
            });
        }
    }).catch(function (err) {
        console.log(err);
    });
}