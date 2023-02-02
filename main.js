#!/usr/bin/env node

process.removeAllListeners('warning')
import fs from 'fs';
import ora from 'ora';
import path from 'path';
import {
    spawn
} from 'child_process';
import yargs from 'yargs';
import Easydl from 'easydl';
/*
const argv = yargs
    .command('input', 'JSON file', (yargs) => {
        yargs.option({
            name: {
                alias: 'i',
                describe: 'The path to the JSON file',
                type: 'string',
                demandOption: true
            }
        });
    })
    .command('output', 'output', (yargs) => {
        yargs.options({
            name: {
                alias: 'o',
                describe: 'The output directory for the downloaded files',
                type: 'string',
                demandOption: true
            }
        });
    })
    .help()
    .argv;
*/
const jsonFile = 'playurl.json';
const outputDir = 'output';
const videoFileName = "video.m4s";
const audioFileName = "audio.m4s";

fs.readFile(jsonFile, (err, data) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    const jsonData = JSON.parse(data);
    const videoUrl = jsonData.data.playurl.video[0].video_resource.url;
    const audioUrl = jsonData.data.playurl.audio_resource[0].url;

    if (!videoUrl) {
        throw new Error("Video URL is empty");
    }

    if (!audioUrl) {
        throw new Error("Audio URL is empty");
    }
    const download = async (url, fileName) => {
        const filePath = path.join(outputDir, fileName);
        const easydl = new Easydl(url, filePath, {
            reportInterval: 3500
        });

        const spinner = ora({
            text: `Downloading ${fileName}...`,
            spinner: 'dots'
        }).start();
        return new Promise((resolve, reject) => {
            easydl.on("error", (error) => {
                    spinner.fail(console.log(error));
                    reject(error);
                })
                .on("progress", ({
                    details,
                    total
                }) => {
                    spinner.start(`Downloading ${fileName}... ${total.percentage.toFixed(2)}% (${bytesToSize(total.speed)}/s)`);
                })
                .on("end", () => {
                    spinner.succeed(`Downloaded ${fileName}`);
                    resolve();
                }).start().setMaxListeners(10);
        });
    };

    async function mergeFiles() {
        await download(videoUrl, videoFileName);
        await download(audioUrl, audioFileName);

        const mkvmergeProcess = spawn("mkvmerge", [
            "-o",
            path.join(outputDir, `output.mkv`),
            path.join(outputDir, videoFileName),
            path.join(outputDir, audioFileName),
        ]);

        mkvmergeProcess.stderr.on("data", (data) => {
            console.error(`Error: ${data}`);
            process.exit(1);
        });

        mkvmergeProcess.on("close", (code) => {
            spinner.info(`mkvmerge process exited with code ${code}`);
            fs.unlinkSync(path.join(outputDir, videoFileName));
            fs.unlinkSync(path.join(outputDir, audioFileName));
            spinner.info(`Files ${videoFileName} and ${audioFileName} have been deleted`);
        });
    }

    function bytesToSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        if (bytes === 0) return 'n/a'
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
        if (i === 0) return `${bytes} ${sizes[i]})`
        return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
    }

    const spinner = ora().start('merging Files');

    (async () => {
        try {
            await mergeFiles();
            spinner.succeed('Done');
        } catch (error) {
            spinner.fail(error);
        }
    })();
});