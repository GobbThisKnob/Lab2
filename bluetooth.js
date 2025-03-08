let {PythonShell} = require('python-shell')


let options = {
  mode: 'json',
  pythonOptions: ['-u'], // get print results in real-time
};

console.log("Starting bluetooth client");
let pyshell = new PythonShell('python_scripts/bt_client.py', options);

pyshell.on('message', function (message) {
    try {
      let response = message;
      document.getElementById("temperature").innerHTML = response.temperature;
      document.getElementById("ultrasonic").innerHTML = response.ultrasonic + " cm";
      document.getElementById("battery").innerHTML = response.battery + " V";
  } catch (error) {
      console.error("Error parsing message:", error);
  }
    
  });