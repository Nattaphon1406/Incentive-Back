#!/bin/bash

 
cd /root/SaveYang_repo

gh repo clone panyawutt/Save-yang-admin-backend

sleep 3

 cp -r /root/SaveYang_repo/Save-yang-admin-backend/docker/docker_dir/save_yang_admin_backend      /root/SaveYang_service/

sleep 1
 mkdir /root/SaveYang_service/save_yang_admin_backend/shard
 mkdir /root/SaveYang_service/save_yang_admin_backend/logs
 mkdir /root/SaveYang_service/save_yang_admin_backend/uploads

cd ~
 

 sleep 2

bash /root/SaveYang_service/save_yang_admin_backend/docker/newInstall.sh