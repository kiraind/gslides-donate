;(function() {
    function _base64ToArrayBuffer(base64) {
        var binary_string =  window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array( len );
        for (var i = 0; i < len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    const socket = new WebSocket("wss://kiraind.ru:2048/")
    const context = new AudioContext()

    socket.onopen = function() {
        console.log("Соединение установлено.")
    }

    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log('Соединение закрыто чисто')
        }
        else {
            console.log('Обрыв соединения')
            console.log('Код: ' + event.code + ' причина: ' + event.reason)
        }
    }

    socket.onmessage = function(event) {
        console.log("Получены данные ", event.data)

        const post = JSON.parse(event.data)

        addNewAlert({ name: post.name || 'Анон', amount: post.amount, content: post.message })

        if(post.voice) {
            const buff = _base64ToArrayBuffer(post.voice_b64)

            context.decodeAudioData(buff, function(buffer) {
                const source = context.createBufferSource();
                //passing in file
                source.buffer = buffer;

                //start playing
                source.connect(context.destination);  // added
                source.start(0);
            })
        }
    }

    socket.onerror = function(error) {
        console.log("Ошибка " + error.message)
    }

    // DOM

    const root = document.createElement('div')
    root.classList.add('pe__root')

    document.onwebkitfullscreenchange = () => {
        if(document.webkitFullscreenEnabled)
            document.webkitFullscreenElement.appendChild(root)
    }

    function addNewAlert({ name, amount, content }) {
        const message = document.createElement('div')
        message.classList.add('pe__message')

        message.innerHTML = `
            <div class="pe__title"><span class="pe__name">${name}</span> —&nbsp;<b>${amount}</b>&nbsp;₽</div>
            <div class="pe__content">
                ${content}
            </div>
        `
        root.appendChild(message)

        setTimeout(() => {
            message.classList.add('disappearing')

            setTimeout(() => {
                root.removeChild(message)
            }, 1000)
        }, 15000)
    }
})();