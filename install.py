#autoflower setup
import os

#path to python
path=os.path.dirname(os.path.abspath(__file__))

#install dependencies
#pip
os.system("sudo apt-get install python-pip")

#apt-get install mysql-server mysql-client
#apt-get install php5 libapache2-mod-php5

#sqlite3:
os.system("sudo apt-get install sqlite3")
#Create database
os.system("cd python; sudo python create_database.py")
#install flask
os.system("sudo pip install Flask")

#install supervisor
os.system("sudo apt-get install supervisor")

#write supervisor config file
print "Configuring Supervisor for autoflower..."
file = open("/etc/supervisor/conf.d/autoflower.conf", "w")
file.write("[program:autoflower]\ndirectory="+path+"/python\ncommand=python server.py\nautostart=true\nautorestart=true\n")
file.close()

#configure supervisor
os.system("sudo cp installation/autoflower.conf /etc/supervisor/conf.d/autoflower.conf")
#updat supervisor
os.system("sudo supervisorctl update")

#restart supervisor
os.system("sudo supervisorctl restart autoflower")

print "DONE"



