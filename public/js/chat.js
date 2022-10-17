const socket = io()

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated!', count)

// })

// document.querySelector('#increment').addEventListener('click', () => {
//     socket.emit('increment')
// })
const $messageform = document.querySelector('#message-form')
const $messageforminput = $messageform.querySelector('input')
const $messageformbutton = $messageform.querySelector('button')
const $sharelocation = document.querySelector('#share')
const $messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const urltemplate = document.querySelector('#url-template').innerHTML
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, { message })
    $messages.insertAdjacentHTML('beforeend', html)

})
socket.on('locationmessage', (url) => {
    console.log(url)
    const html = Mustache.render(urltemplate, { url })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageform.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageformbutton.setAttribute('disabled', 'disabled')

    const message = document.querySelector('input').value

    socket.emit('sendMessage', message, (error) => {
        $messageformbutton.removeAttribute('disabled')
        $messageforminput.value = ''
        $messageforminput.focus()

        if (error) {
            return console.log(error)
        }
        console.log('This message was deliverd')
    })
})
//************************************************************************************************** */
$sharelocation.addEventListener('click', () => {

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported in your browser!')
    }
    $sharelocation.setAttribute('disabled', 'disabled')



    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitute: position.coords.longitude
        }, () => {
            console.log("Location shared!")
        })

        $sharelocation.removeAttribute('disabled')
    })

})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})