import bluetooth

host = "2C:CF:67:3F:58:F0" # The address of Raspberry PI Bluetooth adapter on the server.
port = 3
sock = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
sock.connect((host, port))
while 1:
    # text = input("Enter your message: ") # Note change to the old (Python 2) raw_input
    # if text == "quit":
    #     break
    # sock.send(text)
    data = sock.recv(1024)
    print(data.decode('utf-8')) 

sock.close()


