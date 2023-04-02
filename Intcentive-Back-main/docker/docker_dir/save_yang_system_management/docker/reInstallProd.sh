#!/bin/bash
cd /root/SaveYang_repo/Save_Yang_System_Management
git pull

echo  Pull finished

sleep 1

cd /root/SaveYang_service/save_yang_system_management/docker/out/app

rm main.js

echo  del main.js finished

cp -r /root/SaveYang_repo/save_yang_system_management/dist/main.js  /root/SaveYang_service/save_yang_system_management/docker/out/app
sleep 1

echo  copy main.js finished

cd /root/SaveYang_service/save_yang_system_management/docker/ 
docker stop save_yang_system_management
docker rm save_yang_system_management 
docker rmi save_yang_system_management 
docker build --no-cache -t save_yang_system_management .
docker run --name save_yang_system_management \
-v /root/SaveYang_service/save_yang_system_management/uploads:/usr/src/app/uploads \
-v /root/SaveYang_service/save_yang_system_management/logs:/usr/src/app/logs \
-d -p 65125:3000 save_yang_system_management


docker ps -a

echo  run docker finished