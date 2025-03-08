import bluetooth
import json
import os
import time
from ADC import *

adc = Adc()
hostMACAddress = "2C:CF:67:3F:58:F0" # The address of Raspberry PI Bluetooth adapter on the server. The server might have multiple Bluetooth adapters.
port = 3
backlog = 1
size = 1024
s = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
s.bind((hostMACAddress, port))
s.listen(backlog)
print("listening on port ", port)
try:
    client, clientInfo = s.accept()
    while 1:   
        output_stream = os.popen('vcgencmd measure_temp')
        temp = output_stream.read().split('=')[1]
        battery = adc.recvADC(2)*3
        response = {"temperature" : temp, "ultrasonic" : 10, "battery" : "{:.2f}".format(battery)}
        res = json.dumps(response)
        client.send(res)
        print(res)
        time.sleep(1)
except: 
    print("Closing socket")
    client.close()
    s.close()

