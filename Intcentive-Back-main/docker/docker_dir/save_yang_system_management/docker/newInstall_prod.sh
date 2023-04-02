#!/bin/bash
cd /root/SaveYang_service/save_yang_admin_backend/docker/

sleep 1
docker build --no-cache -t save_yang_admin_backend .
sleep 1

docker run --name save_yang_admin_backend \
-v /root/SaveYang_service/save_yang_admin_backend/uploads:/usr/src/app/uploads \
-v /root/SaveYang_service/save_yang_admin_backend/logs:/usr/src/app/logs \
-d -p 65123:3000 save_yang_admin_backend


docker ps

docker ps -a 
