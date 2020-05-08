const http = require('http')
const qs = require('querystring')
const fs = require('fs')

// const options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/kiraind.ru/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/kiraind.ru/cert.pem'),
//     ca: fs.readFileSync('/etc/letsencrypt/live/kiraind.ru/chain.pem')
// }

const port = 1337

http.createServer(function(request, response) {
    if (request.method == 'POST') {
        console.log('url ' + request.url)        

        let body = ''

        request.on('data', function (data) {
            body += data

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy()
        })
        
        if(request.url === '/ya-notificate/') {
            request.on('end', function () {
                const { label, withdraw_amount } = qs.parse(body)
    
                response.writeHead(200)
                response.end()

                handleConfirmation(label, withdraw_amount)
            })
        }
        else {
            request.on('end', function () {
                response.writeHead(400)
                response.end()
            })
        }        
    }
}).listen(port)

let MessageHandlers = []

function handleConfirmation(transactionId, amount) {
    const unconfirmed = fs.readdirSync('./transactions/unconfirmed')

    if(unconfirmed.indexOf(transactionId) === -1) {
        console.log('Unknown t-on: ' + transactionId)
        return
    }

    const transaction = JSON.parse( fs.readFileSync('./transactions/unconfirmed/' + transactionId, 'utf8') )

    if(amount != transaction.amount){
        console.log(`Wrong amount: ${amount} vs ${transaction.amount}`)
        return
    }
    
    // if all ok

    transaction.date = new Date()
    
    fs.unlinkSync('./transactions/unconfirmed/' + transactionId)

    fs.writeFileSync(
        './transactions/confirmed/' + transactionId,
        JSON.stringify(transaction),
        'utf8'
    )

    // todo sent ws

    MessageHandlers.forEach(handler => handler(transaction))
}

module.exports = MessageHandlers