#!/usr/bin/env node --no-warnings

import fs from 'fs';
import ora from 'ora';
import fetch from 'node-fetch';
import {
    splitUrl,
    fetchseasonurl
} from './worker.js';
import * as dotenv from 'dotenv';
dotenv.config();

let {
    seasonid,
    epid
} = splitUrl(process.env.TESTURL);
console.log(`seasonid: ${seasonid} epid: ${epid}`);
const spinner = ora('Loading...').start();
if (!fs.existsSync('./tmp/')) {
    fs.mkdirSync('./tmp/');
}
//seasonurl
var seasonurl = 'https://api.bilibili.tv/intl/gateway/web/v2/ogv/play/episodes?platform=web?s_locale=th_TH&season_id=' + seasonid;
var seasontd = './tmp/' + seasonid + '/';
//fetch url data
fetchseasonurl(seasonurl, seasontd)
spinner.succeed('Loaded');