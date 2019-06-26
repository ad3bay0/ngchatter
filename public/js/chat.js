const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageInput = $messageForm.querySelector('input');
const $messageBtn = $messageForm.querySelector('button');
const $sendLocationBtn = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

//template

const messagesTemplate = document.querySelector('#message-template').innerHTML;
const linkTemplate = document.querySelector('#link-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
//options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true});

const autoscroll = ()=>{

    //get new message element
    const $newMessage = $messages.lastElementChild;

    //height of new messgae
    const newMessageStyle =  getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight +newMessageMargin;

    //visible height
    const visibleHeight = $messages.offsetHeight;

    //height of messgaes container
    const containerHeight = $messages.scrollHeight;

    //how far have we scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;


    if(containerHeight-newMessageHeight <= scrollOffset){

        $messages.scrollTop = $messages.scrollHeight;
    }
};
socket.on('messages', ({username,message,createdAt}={}) => {

    const html = Mustache.render(messagesTemplate,{username,message,createdAt:moment(createdAt).format('h:mm a')});
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();

});

socket.on('locationmessage', ({username,url,createdAt}) => {
    const html = Mustache.render(linkTemplate,{username,url,createdAt:moment(createdAt).format('h:mm a')});
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
});




$messageForm.addEventListener('submit', (e) => {

    e.preventDefault();
    
    const message = $messageInput.value;

    if (message) {
        $messageBtn.setAttribute('disabled','disabled');
       
      
        socket.emit('sendmessage', message, (error) => {
            $messageBtn.removeAttribute('disabled');
            $messageInput.value = '';
            $messageInput.focus();
        
            if(error){

            }

        });

       

    } else {

        alert('please insert a message')
    }



});

$sendLocationBtn .addEventListener('click', () => {

    if (!navigator.geolocation) {

        return alert('not supported');

    }

    $sendLocationBtn .setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendlocation', { latitude: position.coords.latitude, longitude: position.coords.longitude },(shared)=>{

            $sendLocationBtn .removeAttribute('disabled');
            
        })


    });


});

socket.emit('join',{username,room},(error)=>{

    if(error){

        alert(error);

        location.href = '/index.html';
    }

});

socket.on('roomdata',({room,users})=>{


    const html = Mustache.render(sidebarTemplate,{room,users});
 $sidebar.innerHTML = html;

});