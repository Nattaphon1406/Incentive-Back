#!/bin/bash
cd /root/SaveYang_service_test/save_yang_system_management/docker/

sleep 1
docker build --no-cache -t save_yang_system_management_test .
sleep 1

docker run --name save_yang_system_management_test \
-v /root/SaveYang_service_test/save_yang_system_management/uploads:/usr/src/app/uploads \
-v /root/SaveYang_service_test/save_yang_system_management/logs:/usr/src/app/logs \
-d -p 5551:3000 save_yang_system_management_test


docker ps

docker ps -a 
