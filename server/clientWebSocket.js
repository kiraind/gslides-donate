const WebSocketServer = require('websocket').server
const fs = require('fs')

const httpFileServer = require('./httpFilesNReg')

const clientWsServer = new WebSocketServer({
    httpServer: httpFileServer
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

    // send present list of transactions
    const currentIds = fs.readdirSync('./transactions/confirmed')

    const transactions = currentIds.map(id => JSON.parse(fs.readFileSync('./transactions/confirmed/' + id, 'utf8')))

    transactions.sort((a, b) => (new Date(b.date) - new Date(a.date)))

    connection.send(JSON.stringify(transactions))

    // delete disconnected

    connection.on('close', function(reasonCode, description) {
        const index = Connections.indexOf(connection)

        if (index > -1) {
            Connections.splice(index, 1)
        }
    })
})

function SendToClients(message) {
    const data = '[' + JSON.stringify(message) + ']'

    Connections.forEach(conn => conn.send(data))
}

module.exports = { clientWsServer, SendToClients }