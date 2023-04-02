#!/bin/bash
cd /root/SaveYang_service/save_yang_system_management/docker/

sleep 1
docker build --no-cache -t save_yang_system_management .
sleep 1

echo  build finished

docker run --name save_yang_system_management \
-v /root/SaveYang_service/save_yang_system_management/uploads:/usr/src/app/uploads \
-v /root/SaveYang_service/save_yang_system_management/logs:/usr/src/app/logs \
-d -p 65125:3000 save_yang_system_management

echo  run finished

docker ps

docker ps -a 
echo  finished