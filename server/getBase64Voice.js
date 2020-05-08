const http = require('http')
const fs = require('fs')

var uq = null

var sq = function(a) {
    return function() {
        return a
    }
}

tq = function(a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
        var d = b.charAt(c + 2);
        d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
        d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
        a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
    }
    return a
}

tokenize = function(a) {
    if (null !== uq)
        var b = uq;
    else {
        b = sq(String.fromCharCode(84));
        var c = sq(String.fromCharCode(75));
        b = [b(), b()];
        b[1] = c();
        b = (uq = "422676.4274274743" || "") || ""
    }
    var d = sq(String.fromCharCode(116));
    c = sq(String.fromCharCode(107));
    d = [d(), d()];
    d[1] = c();
    c = "&" + d.join("") + "=";
    d = b.split(".");
    b = Number(d[0]) || 0;
    for (var e = [], f = 0, g = 0; g < a.length; g++) {
        var l = a.charCodeAt(g);
        128 > l ? e[f++] = l : (2048 > l ? e[f++] = l >> 6 | 192 : (55296 == (l & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023),
        e[f++] = l >> 18 | 240,
        e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224,
        e[f++] = l >> 6 & 63 | 128),
        e[f++] = l & 63 | 128)
    }
    a = b;
    for (f = 0; f < e.length; f++)
        a += e[f],
        a = tq(a, "+-a^+6");
    a = tq(a, "+-3^+b+-f");
    a ^= Number(d[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    a %= 1E6;
    return c + (a.toString() + "." + (a ^ b))
};

// entry

function getBase64Voice(text, callback) {
    http.get(
        {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Cookie': '_ga=GA1.3.1106599054.1517953858; OGPC=19005035-1:; SID=2gXEu-BcHOV3Sk9l1PkoBwS_HZ9Pvd-Wz1cgS3YWNxsVXr4u7klz-tSpncf7jhfl5b2GJg.; HSID=ALvMuizood2lEp5Sl; APISID=GNCoFDH3eWOPgn_-/A4ZcY38oPqBgLGKGJ; NID=126=G-wobNy8RgvYnyrmgTdtC-vCpXMXJklo1HeV2P90Eamyfub-UpVsV0G5xzHLTMTkP4NYPKzNZUq4VAQY7aDXktn1k1bsa7i7kUXKTdyDNZyen1a-nGsXns_WpEBkewHrAgOU2vKDAy21qvF62ds2PtJZBSxM4SQL73HEaX3O0MkXhoMAr9Ig3RZPJO0mSE2nI4vwKkghbJisr7gyceml4SoLkYnUjnc0n5tYQckFibz-RKYLNPOXeCynieU8csR9gZZJtr4w8kdf6s9fch17fnRuulaV3c-YMx0; 1P_JAR=2018-3-27-23',
                'Host': 'translate.google.ru',
                'Range': 'bytes=0-',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
            },
            hostname: 'translate.google.ru',
            path: `/translate_tts?ie=UTF-8&q=${encodeURI(text)}&tl=ru&total=1&idx=0&textlen=${text.length}&tk=${tokenize(text)}&client=t&prev=input`
        },
        (resp) => {

        const data = []

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data.push(chunk)
        })

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log('all')

            const audio_b64 = Buffer.concat(data).toString('base64')

            // ready
            callback(audio_b64)
        })

    }).on("error", (err) => {
        console.log("Error: " + err.message)
    })
}

module.exports = getBase64Voice