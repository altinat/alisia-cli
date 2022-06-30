#!/usr/bin/env node --no-warnings

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
