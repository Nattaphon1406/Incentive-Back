#!/bin/bash
cd /root/SaveYang_repo/Save-yang-admin-backend

git pull

echo  Pull finished

sleep 1

cd /root/SaveYang_service/save_yang_admin_backend/docker/out/app

rm main.js

echo  del main.js finished

cp -r /root/SaveYang_repo/Save-yang-admin-backend/dist/main.js  /root/SaveYang_service/save_yang_admin_backend/docker/out/app
sleep 1

echo  copy main.js finished

cd /root/SaveYang_service/save_yang_admin_backend/docker/ 
docker stop save_yang_admin_backend
docker rm save_yang_admin_backend 
docker rmi save_yang_admin_backend 
docker build --no-cache -t save_yang_admin_backend .
docker run --name save_yang_admin_backend \
-v /root/SaveYang_service/save_yang_admin_backend/uploads:/usr/src/app/uploads \
-v /root/SaveYang_service/save_yang_admin_backend/logs:/usr/src/app/logs \
-d -p 65123:3000 save_yang_admin_backend


docker ps -a

echo  run docker finished