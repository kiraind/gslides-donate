import React, { Component } from 'react'
import './App.css'

import MainForm from './MainForm'
import MessageList from './MessageList'

class App extends Component {
    render() {
        return (
            <div className="App">
                <MainForm />
                <MessageList />
            </div>
        );
    }
}

export default App;
