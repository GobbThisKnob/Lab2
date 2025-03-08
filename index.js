document.onkeydown = updateKey;
document.onkeyup = resetKey;

var server_port = 65432;
var server_addr = "10.16.1.102";   // the IP address of your Raspberry PI

const net = require('net');

const client = net.createConnection({ port: server_port, host: server_addr }, () => {
    console.log('Connected to server!');
});


function get_data()
{
    var input = document.getElementById("message").value;
    client.write(input);
    
    // get the data from the server
    client.on('data', (data) => {
        response = JSON.parse(data.toString());
        document.getElementById("direction").innerHTML = response.direction;
        client.end();
        client.destroy();
    });

    client.on('end', () => {
        console.log('disconnected from server');
    });
}

// for detecting which key is been pressed w,a,s,d
function updateKey(e) {
    e = e || window.event;
    let keyValue = null;

    if (e.keyCode == '87') {
        document.getElementById("upArrow").style.color = "green";
        keyValue = "87"; // Up (W)
    } else if (e.keyCode == '83') {
        document.getElementById("downArrow").style.color = "green";
        keyValue = "83"; // Down (S)
    } else if (e.keyCode == '65') {
        document.getElementById("leftArrow").style.color = "green";
        keyValue = "65"; // Left (A)
    } else if (e.keyCode == '68') {
        document.getElementById("rightArrow").style.color = "green";
        keyValue = "68"; // Right (D)
    }

    if (keyValue) {
        client.write(`${keyValue}`);
    }
}

// reset the key to the start state 
function resetKey(e) {
    e = e || window.event;
    document.getElementById("upArrow").style.color = "grey";
    document.getElementById("downArrow").style.color = "grey";
    document.getElementById("leftArrow").style.color = "grey";
    document.getElementById("rightArrow").style.color = "grey";
}

function startVideoStream() {
    const net = require('net');
    const HOST = '10.16.1.102'; 
    const PORT = 60000; 
  
    const client = new net.Socket();
    client.connect(PORT, HOST, () => {
        console.log('Connected to camera server');
    });
  
    let buffer = Buffer.alloc(0);
  
    client.on('data', (data) => {
        buffer = Buffer.concat([buffer, data]);
  
        while (buffer.length >= 4) {
            let frameSize = buffer.readUInt32LE(0);
            if (frameSize > 1000000) {  // Sanity check: Ensure frame is not absurdly large
                console.error(`Invalid frameSize: ${frameSize}`);
                buffer = Buffer.alloc(0); // Reset buffer if invalid data is received
                continue;
            }
            if (buffer.length >= frameSize + 4) {
                let frame = buffer.slice(4, frameSize + 4);
                let frameData = frame.toString('base64');
                document.getElementById('video-feed').src = 'data:image/jpeg;base64,' + frameData;
                buffer = buffer.slice(frameSize + 4);
            } else {
                break;
            }
        }
    });
  
    client.on('close', () => {
        console.log('Connection closed');
        // startVideoStream();
    });
  
    client.on('error', (err) => {
        console.error('Video error:', err);
        // startVideoStream();
    });
}

// Start the video stream when the document is ready
document.addEventListener('DOMContentLoaded', (event) => {
    startVideoStream();
});
