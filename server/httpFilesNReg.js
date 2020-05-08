const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')

const utils = require('./utils')

// const options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/kiraind.ru/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/kiraind.ru/cert.pem'),
//     ca: fs.readFileSync('/etc/letsencrypt/live/kiraind.ru/chain.pem')
// }

const httpFileServer = http.createServer(function (request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*')

    // handle Register

    if(request.method === 'POST') {
        let body = ''

        request.on('data', function (data) {
            body += data

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy()
        })

        if(request.url === '/register/') {
            request.on('end', function () {
                try {   
                    var { amount, name, message, voice } = JSON.parse(body)
                } catch(e) {
                    response.writeHead(400)
                    response.end('Wrong data format #0')
                    return
                }

                // validate

                if(typeof amount  !== 'number' ||
                   typeof name    !== 'string' ||
                   typeof message !== 'string' ||
                   typeof voice   !== 'boolean') {
                    response.writeHead(400)
                    response.end('Wrong data format #1')
                    return
                }

                if(utils.calculatePrice(message, name, voice) !== amount) {
                    response.writeHead(400)
                    response.end('Wrong calculated amount')
                    return
                }
                
                // store

                const transactionId = utils.randomB64(32)

                fs.writeFileSync(
                    './transactions/unconfirmed/' + transactionId,
                    JSON.stringify({
                        amount,
                        name,
                        message,
                        voice,
                        date: new Date()
                    }),
                    'utf8'
                )
    
                response.writeHead(200, {'Access-Control-Allow-Origin': '*'})
                response.end(transactionId)
            })
        }
        else {
            request.on('end', function () {
                response.writeHead(400)
                response.end()
            })
        }  

        return;
    }

    // parse URL
    const parsedUrl = url.parse(request.url)
    // extract URL path
    let pathname = './frontend' + parsedUrl.pathname
    // based on the URL path, extract the file extention. e.g. .js, .doc, ...
    let ext = path.parse(pathname).ext

    if(!ext)
        ext = '.html'
    // maps file extention to MIME type
    const map = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword'
    }

    fs.exists(pathname, function (exist) {
        if(!exist) {
            // if the file is not found, return 404
            response.statusCode = 404
            response.end(`File ${pathname} not found!`)
            return
        }

        // if is a directory search for index file matching the extention
        
        if (fs.statSync(pathname).isDirectory())
            pathname += 'index' + ext

        // read file from file system
        fs.readFile(pathname, function(err, data) {
            if(err) {
                response.statusCode = 500
                response.end(`Error getting the file: ${err}.`)
            } else {
                // if the file is found, set Content-type and send data
                response.setHeader('Content-type', map[ext] || 'text/plain' )
                response.end(data)
            }
        })
    })
})

module.exports = httpFileServer