#!/usr/bin/env node --no-warnings

import fs from 'fs';
import ora from 'ora';
import input from '@inquirer/input';
import inquirer from 'inquirer';
import fetch from 'node-fetch';
import {
    splitUrl,
    fetchseasonurl
} from './worker.js';
import * as dotenv from 'dotenv';
dotenv.config();
//ask link and generate ids
let url = await input({
    message: 'Enter Bilibili.tv link:',
});
//if not set
if (!url) {
    console.log('No link entered');
    process.exit();
}

let {
    seasonid,
    epid
} = splitUrl(url);

inquirer.prompt([{
    type: 'list',
    name: 'imode',
    message: 'Select mode',
    choices: ['Seasons', 'Episodes'],
    default: 'Seasons'
}]).then(({
    imode
}) => {
    if (imode === 'Seasons') {
        const spinner = ora('Loading...').start();
        if (!fs.existsSync('./tmp/')) {
            fs.mkdirSync('./tmp/')
        }
        //seasonurl
        var seasonurl = 'https://api.bilibili.tv/intl/gateway/web/v2/ogv/play/episodes?platform=web?s_locale=th_TH&season_id=' + seasonid;
        var seasontd = './tmp/' + seasonid + '/';
        //fetch url data
        fetchseasonurl(seasonurl, seasontd)
        spinner.stop();
    } else if (imode === 'Episodes') {
        console.log('episodes');
    } else {
        console.log('error');
    }
});