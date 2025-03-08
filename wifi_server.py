import socket
import json
import os
import io
import struct
import threading
from Motor import *
from servo import *
from picamera2 import Picamera2,Preview
from picamera2.encoders import JpegEncoder
from picamera2.outputs import FileOutput
from picamera2.encoders import Quality
from threading import Timer
from threading import Thread
from threading import Condition

HOST = "10.16.1.102" # IP address of your Raspberry PI
PORT = 65432          # Port to listen on (non-privileged ports are > 1023)
CAM_PORT = 60000


motors = Motor()
servo = Servo()
servo.setServoPwm('0', 95)
# adc=Adc()

class StreamingOutput(io.BufferedIOBase):
    def __init__(self):
        self.frame = None
        self.condition = Condition()

    def write(self, buf):
        with self.condition:
            self.frame = buf
            self.condition.notify_all()

def sendvideo():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, CAM_PORT))
        s.listen()

        try:
            camera = Picamera2()
            camera_config = camera.create_video_configuration(
                main={"size": (640, 480), "format": "RGB888"}  # Explicitly set format
            )
            camera.configure(camera_config)

            output = StreamingOutput()
            encoder = JpegEncoder(q=90)
            camera.start_recording(encoder, FileOutput(output), quality=Quality.VERY_HIGH)

            # print("Camera configuration:", camera.camera_configuration())
            client, clientInfo = s.accept()
            while True:
                with output.condition:
                    output.condition.wait()
                    frame = output.frame

                try:
                    lenFrame = len(frame)
                    lengthBin = struct.pack('<I', lenFrame)
                    client.sendall(lengthBin)
                    client.sendall(frame)
                except Exception as e:
                    print("Transmission error:", e)
                    camera.stop_recording()
                    camera.close()
                    print("Closing Camera socket")
                    client.close()
                    s.close()
                    break

        except Exception as e:
            print("Camera error:", e)
        finally:
            camera.stop_recording()
            camera.close()
            print("Closing Camera socket")
            client.close()
            s.close()


thread = threading.Thread(target=sendvideo, daemon=True)
thread.start()

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()
    try:
        client, clientInfo = s.accept()
        client.settimeout(0.5)

        while 1:
            try:
                data = client.recv(1024)
                if data != b"":
                    direction = ""
                    if data == b'87':
                        direction = "Forward"
                        motors.setMotorModel(1000, 1000, 1000, 1000)
                    elif data == b'83':
                        direction = "Backward"
                        motors.setMotorModel(-2000, -2000, -2000, -2000)
                    elif data == b'65':
                        direction = "Left"
                        motors.setMotorModel(-2000, -2000, 2000, 2000)
                    elif data == b'68':
                        direction = "Right"
                        motors.setMotorModel(2000, 2000, -2000, -2000)
                    else:
                        motors.setMotorModel(0, 0, 0, 0)

                    response = {"direction": direction}
                    res = json.dumps(response)
                    client.sendall(bytes(res, encoding="utf-8"))
            except socket.timeout:
                motors.setMotorModel(0, 0, 0, 0)
    except Exception as e:
        print("Closing socket")
        motors.setMotorModel(0, 0, 0, 0)
        client.close()
        s.close()
        print(e)