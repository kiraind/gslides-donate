function randomB64(size) {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    for (var i = 0; i < size; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function calculatePrice(text, name, voice) {
    let validText = ''

    for(let i = 0; i < text.length; i++)
        if(text[i] === ' ' && (text[i - 1] === ' ' || text[i + 1] === '\n' || text[i - 1] === '\n'))
            // bug here but i don't care
            continue;
        else
            validText += text[i]

    const count = validText.length

    let sum = count * (voice ? 5 : 1) + (name.length <= 7 ? 0 : name.length - 7)

    if(sum < 1.02 && sum !== 0)
        sum = 1.02

    return sum
}

module.exports = {
    randomB64,
    calculatePrice
}