import React from 'react'

import './MessageList.css'

const Message = ({message}) => (
    <div className="Message">
        <div className="MessageHeader">
            <div className="MessageName">
                {message.name || 'Анон'}
            </div>
            <div className="MessagePrice">
                {message.amount}&nbsp;<b>₽</b>
            </div>
        </div>
        <div className="MessageBody">
            {message.message}
        </div>
    </div>
)

export default class MessageList extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            messages: [],
            messagesAvailable: false
        }

        const ws = new WebSocket('wss://kiraind.ru/') // + window.location.host)

        ws.onmessage = (event) => {
            const { data } = event
            
            this.setState({
                messages: [...JSON.parse(data), ...this.state.messages],
                messagesAvailable: true
            })
        }
    }

    render() {

        return(
            <div className="MessageList">
                {
                    this.state.messages.map((item, i) => <Message message={item} key={item.date} />)
                }
            </div> 
        )
    }
}