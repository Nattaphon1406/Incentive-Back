#!/bin/bash

 
cd /root/SaveYang_repo

gh repo clone panyawutt/Save_Yang_System_Management

sleep 3

 cp -r /root/SaveYang_repo/Save_Yang_System_Management/docker/docker_dir/save_yang_system_management      /root/SaveYang_service/

sleep 1
 mkdir /root/SaveYang_service/save_yang_system_management/shard
 mkdir /root/SaveYang_service/save_yang_system_management/logs
 mkdir /root/SaveYang_service/save_yang_system_management/uploads

cd ~
 

 sleep 2

bash /root/SaveYang_service/save_yang_system_management/docker/newInstall.sh