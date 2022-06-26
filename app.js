#!/usr/bin/env node --no-warnings

import fs from 'fs';
import ora from 'ora';
import input from '@inquirer/input';
import inquirer from 'inquirer';


//ask link and generate ids
const url = await input({message:'Enter link to generate ids'});
var pathname = new URL(url).pathname;
if (pathname.indexOf('/th/play/') > -1) {
    var seasonid = pathname.split('/')[3];
    var epid = pathname.split('/')[4];
} // else { var seasonid = pathname.split('/')[3]; }

inquirer.prompt([{
    type: 'list',
    name: 'imode',
    message: 'Select mode',
    choices: ['Episodes', 'Seasons']}
]).then(( {imode} ) => {
    if (imode == 'seasons') {
    const spinner = ora('Load Series json files...').start();
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
    spinner.succeed();
    } else if (imode == 'episodes') {
        console.log('episodes');
    } else {
        console.log('error');
    }});