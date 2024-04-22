import './style.css';
import $ from 'jquery';


const App = () => {


  navigator.mediaDevices.getUserMedia( {audio: true}).then((stream) => {
    const mediaRecorder  = new MediaRecorder(stream, {MimeType: 'audio/webm'})
    // const socket = new WebSocket('wss://api.deepgram.com/v1/listen', ['token', '00c545622f4d5cf9d433f792d51fc0b8965a4c99'] )
    // const WebSocket = require('ws');

    // const { Deepgram } = require('@deepgram/sdk')
    // const deepgram = new Deepgram("00c545622f4d5cf9d433f792d51fc0b8965a4c99")

    // const [setSocket] = useState(null);

    const socket = new WebSocket('wss://api.deepgram.com/v1/listen', ['token', '8d1afa83d1fe2af1b980de663e9f2583ffdd1314']);
    // setSocket(socket);
    

    socket.onopen = () =>{
        mediaRecorder.addEventListener('dataavailable', event => {
            if (event.data.size > 0 && socket.readyState === 1) {
            socket.send(event.data)
        }
        })
        console.log(mediaRecorder)
        if (mediaRecorder['state']!=='recording'){
            mediaRecorder.start(200)
        }
        
    }
    
    // socket.onclose = () =>{
    //     console.log("close connection!")
    // }
    
    function getResponse(human_transcript, transcript){
      console.log("###################")
      console.log(human_transcript)
      console.log("###################")



      document.querySelector('div > p:last-of-type').innerHTML = human_transcript
            // call ajax
            $.ajax({
                url: 'https://quickagentbe2.onrender.com/datagram/text_to_text/',
                type: "POST",
                data : {transcript : transcript},
                success: function (data) {
                    let x = "<p>Bot:" + data['res'] + "</p>"
                    $("#chatMessage").append(x)

                    var msg = new SpeechSynthesisUtterance(data['res']);
                    async function speakText(msg){
                    speechSynthesis.speak(msg)
                    }

                    speakText(msg)
                    function greeting() {

                        if (transcript==='bye' || transcript==='goodbye' ||transcript==='good bye'){
                          mediaRecorder.stop()
                        }
                        else{
                        mediaRecorder.resume()
                        $("#chatMessage").append("<p>Loading...</p>")
                        }
                        
                    }


                    setTimeout(greeting, 5000);
                    
                    // mediaRecorder.resume()
                },
                error: function (error) {
                    let display_message = "<p>" + error['display_message'] + "</p>"
                    $("#chatMessage").append(display_message)
                    // $("#chatMessage").append("<p>Loading...</p>")
                }
            });

    }

    socket.onmessage = (message) =>{
        const received = JSON.parse(message.data)
        console.log(received['channel'])
        if (received['channel']!==undefined && received['channel']['alternatives'][0]['transcript']!==''){
            const transcript = received.channel.alternatives[0].transcript

        
        //display this transcript on web page
        
        var human_transcript = 'Human:' + transcript
        
        // if length of transcript is greater then 0
        if (transcript.length>0){
          mediaRecorder.pause()
          getResponse(human_transcript, transcript)
        }
        }
        else{
            console.log("No voice found")
        }
        
        
    }

    //
})

  return (
    <header>
      <h1>Live Chat Room</h1>
    </header>
  );
};

export default App;
