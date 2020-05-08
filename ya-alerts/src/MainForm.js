import React from 'react'

import './MainForm.css'

import BigOverlay from './BigOverlay'

import ic_warning from './icons/warning.svg'

export default class MainForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            status: 'waiting',
            voice: false,
            text: '',
            sum: 0,
            notification: { shown: false },
            transactionId: '',
            paymentType: '' // "AC" | "PC" 
        }

        this.toggleVoice = this.toggleVoice.bind(this)
        this.updateSum = this.updateSum.bind(this)
        this.trySend = this.trySend.bind(this)
        this.hideNotification = this.hideNotification.bind(this)
        this.pay = this.pay.bind(this)
    }

    toggleVoice() {
        window.navigator.vibrate(10)

        const count = this.state.text.length

        this.setState({
            voice: !this.state.voice,
            sum: (count === 1 && this.state.voice ? 1.02 : count) * (!this.state.voice ? 5 : 1)
        })  
    }

    updateSum() {
        const text = this.refs.text.value.trim()
        const name = this.refs.name.value.trim()

        let validText = ''
        for(let i = 0; i < text.length; i++)
            if(text[i] === ' ' && (text[i - 1] === ' ' || text[i + 1] === '\n' || text[i - 1] === '\n'))
                // bug here but i don't care
                continue;
            else
                validText += text[i];

        const count = validText.length
        const k = 5
        //let sum = Math.round(k * Math.log(count + 1) * 2) / 2// * (this.state.voice ? 5 : 1) + (name.length <= 7 ? 0 : name.length - 7)

        let sum = (count === 2) ? 1 : Math.round(10 * (Math.log(count / 10 + 0.36787944117) + 0.36787944117) + 1)

        if(sum < 1.02 && sum !== 0)
            sum = 1.02

        this.setState({
            text: validText,
            name,
            sum
        })
    }

    trySend() {
        if(this.state.sum > 0) {
            // send
            this.setState({
                status: 'loading'
            })

            // get id here todo

            fetch(window.location.origin + '/register/', {
                    method: 'POST',
                    body: JSON.stringify({
                        amount: this.state.sum,
                        name: this.state.name,
                        message: this.state.text,
                        voice: this.state.voice
                    })
                })
                .then(response => {
                   return response.text()
                })
                .then(transactionId => this.setState({
                        transactionId,
                        status: 'selection',
                        aaa: console.log(transactionId)
                        
                    })
                )
        }
        else {
            // make notification
            this.setState({
                notification: {
                    shown: true,
                    text: "Будем считать, что пустое сообщение отправлено."
                }
            })
            setTimeout(() => this.setState({
                notification: { ...this.state.notification, shown: false }
            }), 5000)
        }
    }

    hideNotification() {
        this.setState({
            notification: { ...this.state.notification, shown: false }
        })
    }

    pay(type) {
        this.setState({
            status: 'loading',
            paymentType: type
        })

        setTimeout(() => this.refs.form.submit(), 200)
    }

    render() {
        return(
            <div className="MainForm">
                <div className={"Notification" + (this.state.notification.shown ? " shown" : "")}
                    onClick={this.hideNotification}
                >
                    <div className="NotificationHeader">
                        <div className="NotificationIcon">
                            <img src={ic_warning}  alt="Предупреждение" />
                        </div>
                        <div className="NotificationTitle">Ну ок</div>
                    </div>
                    <div className="NotificationText">{this.state.notification.text}</div>
                </div>
                <div className="MainFormTextContainer">
                    <textarea placeholder="cообщение"
                        onChange={this.updateSum}
                        ref="text"
                        onFocus={this.hideNotification}
                        autoFocus
                    ></textarea>
                    <div className="CharCounter">{this.state.sum}<b>&nbsp;₽</b></div>
                </div>
                <div className="MainFormUI">
                    <div className="MainFormName">
                        <input type="text"
                            placeholder="подпись"
                            onChange={this.updateSum}
                            ref="name"
                        />
                    </div>                    
                    <div className="MainFormVoice"
                        onClick={this.toggleVoice}
                    >
                        <div className={"VoiceCheckbox" + (this.state.voice ? ' checked' : '')}></div>
                        <div className="VoiceLabel">в&nbsp;голос</div>
                    </div>
                    <div className="MainFormConfirm">
                        <div
                            onClick={this.trySend}
                        >Отправить</div>
                    </div>
                </div>
                {
                    this.state.status === 'loading' ? <BigOverlay loading pay={this.pay} /> :
                    this.state.status === 'selection' ? <BigOverlay selecting pay={this.pay} /> : ''
                }

                {/* Hidden form */}

                <form ref="form" method="POST" action="https://money.yandex.ru/quickpay/confirm.xml">
                    
                    {/* Номер кошелька в системе Яндекс Денег */}
                    <input type="hidden" name="receiver" value="410013865586702" />

                    {/* Название платежа (длина 50 символов) */}
                    <input type="hidden" name="formcomment" value="Леха" />
                    
                    {/*  ID транзакции */}
                    <input type="hidden" name="label" value={this.state.transactionId} />
                    
                    {/* Тип формы, может принимать значения shop (универсальное), donate (благотворительная), small (кнопка) */}
                    <input type="hidden" name="quickpay-form" value="donate" />
                    
                    {/* Назначение платежа, это покупатель видит на сайте Яндекс Денег при вводе платежного пароля (длина 150 символов) */}
                    <input type="hidden" name="targets" value={'Донат Лехе: ' + this.state.text} />
                    
                    {/* Сумма платежа, валюта - рубли по умолчанию */}
                    <input type="hidden" name="sum" value={this.state.sum} data-type="number" />
                    
                    {/* Должен ли Яндекс запрашивать ФИО покупателя */}
                    <input type="hidden" name="need-fio" value="false" />
                    
                    {/* Должен ли Яндекс запрашивать email покупателя */}
                    <input type="hidden" name="need-email" value="false" />
                    
                    {/* Должен ли Яндекс запрашивать телефон покупателя */}
                    <input type="hidden" name="need-phone" value="false" />
                    
                    {/* Должен ли Яндекс запрашивать адрес покупателя */}
                    <input type="hidden" name="need-address" value="false" />
                    
                    {/* Метод оплаты, PC - Яндекс Деньги, AC - банковская карта */}
                    <input type="hidden" name="paymentType" value={this.state.paymentType} />
                    
                    {/* Куда перенаправлять пользователя после успешной оплаты платежа */}
                    <input type="hidden" name="successURL" value="https://kiraind.ru/" />
                </form>
            </div>
        )
    }
}