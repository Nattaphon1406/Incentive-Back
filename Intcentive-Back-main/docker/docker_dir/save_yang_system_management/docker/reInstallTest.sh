#!/bin/bash

cd /root/SaveYang_repo_test/Save_Yang_System_Management

git pull

echo  Pull finished

sleep 1

cd /root/SaveYang_service_test/Save_Yang_System_Management/docker/out/app

rm main.js

echo  del main.js finished

cp -r /root/SaveYang_repo_test/Save_Yang_System_Management/dist/main.js  /root/SaveYang_service_test/save_yang_system_management/docker/out/app
sleep 1

echo  copy main.js finished

cd /root/SaveYang_service_test/save_yang_system_management/docker/ 

docker stop save_yang_system_management_test
docker rm save_yang_system_management_test 
docker rmi save_yang_system_management_test 
docker build --no-cache -t save_yang_system_management_test .
docker run --name save_yang_system_management_test \
-v /root/SaveYang_service_test/save_yang_system_management/uploads:/usr/src/app/uploads \
-v /root/SaveYang_service_test/save_yang_system_management/logs:/usr/src/app/logs \
-d -p 5551:3000 save_yang_system_management_test


docker ps -a

echo  run docker finished