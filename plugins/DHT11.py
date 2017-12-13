#subprocess support to run the DHT binary
import subprocess
import sys
import re

DHT_TEMPERATURE=''
DHT_HUMIDITY=''
success_count=0

while(success_count<2):
    #run the DHT binary and save to global variables
    data = str(subprocess.check_output(["sudo", "../plugins/DHT_bin", "11", str(sys.argv[1])]))
    matches = re.search("Temp =\s+([0-9.]+)", data)
    if(matches):
        DHT_TEMPERATURE= matches.group(1)
        success_count+=1
    matches = re.search("Hum =\s+([0-9.]+)", data)
    if(matches):
        DHT_HUMIDITY= matches.group(1)
        success_count+=1
    if success_count==2:
        print '{"temperature":'+DHT_TEMPERATURE+', "humidity":'+DHT_HUMIDITY+'}'
    else:
        success_count=0

