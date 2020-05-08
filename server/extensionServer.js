const WebSocketServer = require('websocket').server
const http = require('http')

const getBase64Voice = require('./getBase64Voice')

const httpServer = http.createServer(function (request, response) { })
httpServer.listen(2048)

const clientWsServer = new WebSocketServer({
    httpServer
})
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  console.log(origin)  
  return true
}

let Connections = []
 
clientWsServer.on('request', function(request) {
    // connect

    if (!originIsAllowed(request.origin)) {
        request.reject()
        return
    }
    
    const connection = request.accept(null, request.origin)

    Connections.push(connection)

    console.log('Ext connected')

    // delete disconnected

    connection.on('close', function(reasonCode, description) {
        const index = Connections.indexOf(connection)

        if (index > -1) {
            Connections.splice(index, 1)
        }

        console.log('Ext disconnected')
    })
})

function SendToExt(message) {
    if(message.voice) {
        getBase64Voice(message.message, voice_b64 => {
            message.voice_b64 = voice_b64

            const data = JSON.stringify(message)

            Connections.forEach(conn => conn.send(data))
        })
    }
    else {
        const data = JSON.stringify(message)

        Connections.forEach(conn => conn.send(data))
    }
}

module.exports = { SendToExt }