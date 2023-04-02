#!/bin/bash
cd /root/SaveYang_repo_test 

gh repo clone panyawutt/Save_Yang_System_Management 
sleep 3 
 cp -r /root/SaveYang_repo_test/Save_Yang_System_Management/docker/docker_dir/save_yang_system_management      /root/SaveYang_service_test/ 
sleep 1 
 mkdir /root/SaveYang_service_test/save_yang_system_management/shard 
 mkdir /root/SaveYang_service_test/save_yang_system_management/logs 
 mkdir /root/SaveYang_service_test/save_yang_system_management/uploads 
cd /root 
 sleep 2 
bash /root/SaveYang_service_test/save_yang_system_management/docker/newInstall_test.sh 