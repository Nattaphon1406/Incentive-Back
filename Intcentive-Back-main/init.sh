#!/bin/bash

docker image build -t intcentive-back .

echo  build finished

sleep 1

docker run --name intcentive-back -d -p 65131:9998 intcentive-back 
sleep 1

echo  run finished

docker ps