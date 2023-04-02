#!/bin/bash

docker stop intcentive-back 

echo  stop finished

sleep

docker rm intcentive-back 

echo  rm finished

sleep 1

docker rmi intcentive-back 

echo  rmi finished


git stash && git pull && git stash drop stash@{0} 

echo  git stash && git pull finished

sleep 1

docker image build -t intcentive-back .

echo  build finished

sleep 1

docker run --name intcentive-back -d -p 65131:9998 intcentive-back 
sleep 1

echo  run finished

docker ps