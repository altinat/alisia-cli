#!/usr/bin/env node --no-warnings

import fs from 'fs';
import ora from 'ora';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

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

const login_token = process.env.COOKIES;
export function fetchseasonurl(seasonurl, seasontd, login_token) {
    const spinner = ora('Loading...').start();
    fetch(seasonurl).then(function (response) {
        return response.json();
    }).then(function (data) {
        const d = data.data.sections[0].episodes;
        //loop data and output episode_id
        for (let i = 0; i < d.length; i++) {
            fetch('https://api.bilibili.tv/intl/gateway/web/playurl?device=wap&platform=web&qn=64&tf=0&type=0&ep_id=' + d[i].episode_id, login_token)
                .then(function (response) {
                    return response.json();
                }).then(function (data) {
                    if (!fs.existsSync(seasontd)) {
                        fs.mkdirSync(seasontd);
                    }
                    fs.writeFileSync(seasontd + d[i].episode_id + '.json', JSON.stringify(data));
                    spinner.succeed('Saved ' + d[i].title_display);
                    //get subtitle files
                    fetch('https://api.bilibili.tv/intl/gateway/m/subtitle?ep_id=' + d[i].episode_id, login_token).then(function (response) {
                        return response.json();
                    }).then(function (data) {
                        fs.writeFileSync(seasontd + d[i].episode_id + '-sub' + '.json', JSON.stringify(data));
                    });
                });
        }
    })
}