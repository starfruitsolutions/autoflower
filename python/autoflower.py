import thread
from flask import *
import sqlite3
import re
import json
import os
import subprocess
import datetime
from time import sleep
import ast
import RPi.GPIO as GPIO

#!!!database class and config function!!!
class Database:
    def __init__(self, path, table):
        self.path=path
        self.table=table
        self.database=''
        self.rows={}
        self.loadTable()

    #connect to database
    def connectDB(self):
        try:
            self.database=sqlite3.connect(self.path)
        except:
            print "Could not open database @"+self.path
    #close database
    def closeDB(self):
        self.database.close()

    def commitDB(self):
        self.database.commit()

    #load specified table into table
    # * Efficiency changes:
    # * http://stackoverflow.com/questions/3286525/return-sql-table-as-json-in-python
    # * https://docs.python.org/2/library/sqlite3.html#sqlite3.Row
    def loadTable(self):
        #connect
        self.connectDB()
        #dict_factory
        def dict_factory(cursor, row):
            d = {}
            for idx, col in enumerate(cursor.description):
                d[col[0]] = row[idx]
            return d
        #set database to return dictionaries
        self.database.row_factory = dict_factory
        #initialize cursor
        cursor=self.database.cursor()
        #loop through rows
        try:
            for row in cursor.execute("SELECT * FROM "+self.table):
                self.rows[row['ID']]=row
            self.json=json.dumps(self.rows)
        except:
            print "'"+self.table+"' table does not exist or could not be loaded. Use .create(categories) to create one."
        self.closeDB()

    #useful functions
    #get table column names
    def get_headers(self, table):
        self.connectDB()
        command = "PRAGMA table_info(stocks)"
        print self.database.execute(command)
        return self.database.execute(command)

    #update database value
    def update(self, selector, selection, column, new_value):
        self.connectDB()
        command="UPDATE "+self.table+" set "+column+" = '"+new_value+"' WHERE "+selector+"='"+selection+"'"
        print command
        self.database.execute(command)
        self.commitDB()
        self.closeDB()

    #insert new row
    def insert(self, columns, values):
        self.connectDB()
        command="INSERT INTO "+self.table+" "+columns+" VALUES "+values
        print command
        self.database.execute(command)
        self.commitDB()
        self.closeDB()

    #delete row
    def delete(self, ID):
        self.connectDB()
        command="DELETE FROM "+self.table+" WHERE ID="+ID
        print command
        self.database.execute(command)
        self.commitDB()
        self.closeDB()

    #create table
    def create(self, categories):
        self.connectDB()
        command="CREATE TABLE if not exists "+self.table+" "+categories
        print command
        self.database.execute(command)
        self.commitDB()
        self.closeDB()
    #Drop table
    def drop(self):
        self.connectDB()
        command="DROP TABLE if exists "+self.table
        print command
        self.database.execute(command)
        self.commitDB()
        self.closeDB()

    #refresh the table in memory
    def refresh(self):
        self.loadTable()

#load config
#load basic configuration(database info)
def config(path,search):
    try:
        #read the config file and convert to dictionary
        f=open(path)
        config=f.read()#read file and set to config
        f.close()
        #search through file for config info
        #get database username
        match = re.search(r'"'+search+'=([\S\.-]+)"', config)
        if(match):
            return str(match.group(1))
    except:
        pass
        print "No config match for term"

#!!!Load tables
PLUGINS=Database('../database/pio.db', 'PLUGINS')
SENSORS=Database('../database/pio.db', 'SENSORS')
OUTPUT=Database('../database/pio.db', 'PIN_STATES')
SCHEDULES=Database('../database/pio.db', 'TIMERS')
TEMP_CONTROL=Database('../database/pio.db', 'TEMP_CONTROL')
DHT_DATA=Database('../database/pio.db', 'DHT_DATA')
HISTORICAL_TEMPERATURE=Database('../database/pio.db', 'HISTORICAL_TEMPERATURE')
HISTORICAL_EVENT=Database('../database/pio.db', 'HISTORICAL_EVENT')
#!!!plugins!!!
#setup
def plugins_setup():
    #erase existing table
    PLUGINS.drop()
    #build new table based on files in the plugins folder
    PLUGINS.create("(ID INTEGER PRIMARY KEY, NAME TEXT)")
    for file in os.listdir("../plugins"):
        if file.endswith(".py"):
            PLUGINS.insert("(NAME)", "('"+str(file)[:-3]+"')")
    #Build sensor table if it doesn't exist
    SENSORS.create("(ID INTEGER PRIMARY KEY, NAME TEXT, PIN INT NOT NULL, TYPE TEXT NOT NULL, DATA TEXT)")
#loop
def plugins_loop():
    SENSORS.refresh()
    for sensor in SENSORS.rows:
        data = str(subprocess.check_output(["sudo", "python", "../plugins/"+SENSORS.rows[sensor]['TYPE']+".py", str(SENSORS.rows[sensor]['PIN'])]))
        if data != 'ERROR':
            SENSORS.update("ID", str(SENSORS.rows[sensor]['ID']), "DATA", data)

#!!!Scheduling!!!
#loop through timers
def schedule_loop():
    SCHEDULES.refresh()
    now = datetime.datetime.now()
    for row in SCHEDULES.rows:
        #define times
        on=SCHEDULES.rows[row]['ON_TIME'].split(":",2)
        off=SCHEDULES.rows[row]['OFF_TIME'].split(":",2)
        #convert to integers
        on = [ int(x) for x in on ]
        off = [ int(x) for x in off ]
        #define devices
        devices=SCHEDULES.rows[row]['DEVICES'].split()
        #check for on/off
        if((now.hour>=(on[0]+1) or (now.hour>=on[0] and now.minute>=on[1])) and not (now.hour>=(off[0]+1) or (now.hour>=off[0] and now.minute>=off[1]))):
            #turn on devices
            for device in devices:
                    OUTPUT.update('NAME', str(device), 'STATE', '1')
        else:
            for device in devices:
                    OUTPUT.update('NAME', str(device), 'STATE', '0')

#!!!Temperature Control!!!


def temperature_control_loop():

    #refresh the databases
    TEMP_CONTROL.refresh()
    SENSORS.refresh()
    #loop through each temperature control setting, compare it to sensor data, and switch the devices associated
    for row in TEMP_CONTROL.rows:
        setting=int(TEMP_CONTROL.rows[row]['SETTING'])
        sensor=int(TEMP_CONTROL.rows[row]['SENSOR'])
        temp=int(ast.literal_eval(SENSORS.rows[sensor]['DATA'])['temperature'])
        try:
            devices=TEMP_CONTROL.rows[row]['DEVICES'].split()
        except:
            devices=''

        if (temp<setting):
            #switch output devices off
            for device in devices:
                OUTPUT.update('NAME', str(device), 'STATE', '0')

        elif (temp>=setting):
            for device in devices:
                OUTPUT.update('NAME', str(device), 'STATE', '1')

#!!!Hardware Output control!!!
#setup outputs
def output_setup():
    # Set the mode of numbering the pins.
    GPIO.setmode(GPIO.BCM)

def output_loop():
        #refresh DB
        OUTPUT.refresh()
        #set outputs to GPIO outputs
        for row in OUTPUT.rows:
            pin=OUTPUT.rows[row]['PIN']
            state=OUTPUT.rows[row]['STATE']
            on_state=OUTPUT.rows[row]['ON_STATE']
            #tailor each to format
            GPIO.setup(pin, GPIO.OUT)
            #switch pins
            if (state==1):
                if (on_state==1):
                    GPIO.output(pin, True)
                elif (on_state==0):
                    GPIO.output(pin, False)
                else:
                    print "No ON_STATE specified."
            elif (state==0):
                if (on_state==1):
                    GPIO.output(pin, False)
                elif (on_state==0):
                    GPIO.output(pin, True)
                else:
                    print "No ON_STATE specified."

#!!!Historical Data!!!


def historical_data_loop():
    #refresh the tables
    DHT_DATA.refresh()
    OUTPUT.refresh

    #loop through each sensor and record it to historical table
    for row in DHT_DATA.rows:
       HISTORICAL_TEMPERATURE.insert("(SENSOR,TEMPERATURE,HUMIDITY)", str("("+str(DHT_DATA.rows[row]['ID'])+","+str(DHT_DATA.rows[row]['TEMPERATURE'])+","+str(DHT_DATA.rows[row]['HUMIDITY'])+")"))

    #loop through each output and record it to historical tables
    for row in OUTPUT.rows:
        HISTORICAL_EVENT.insert("(PIN,STATE,NAME,TYPE,ON_STATE)", str("("+str(OUTPUT.rows[row]['PIN'])+","+str(OUTPUT.rows[row]['STATE'])+",'"+str(OUTPUT.rows[row]['NAME'])+"','"+str(OUTPUT.rows[row]['TYPE'])+"',"+str(OUTPUT.rows[row]['ON_STATE'])+")"))

#!!!main autoflower functions!!!
def setup():
    #start server
    #subprocess.call(["sudo", "python", "server.py"])
    #setups
    plugins_setup()
    output_setup()

#loop functions
def loop():
    plugins_loop()
    output_loop()
    schedule_loop()
    temperature_control_loop()

def autoflower():
    try:
        setup()
    #open historical loop
        while(1):
            historical_data_loop()
    #realtime loop
            for i in range(20):
                loop()
                sleep(3)

    #cleanup on exit
    except KeyboardInterrupt:
        GPIO.cleanup()

app = Flask(__name__)
tables=['PIN_STATES','DHT_DATA', 'DHT_SENSOR', 'TIMERS', 'TEMP_CONTROL', 'ZONES', 'HISTORICAL_TEMPERATURE','HISTORICAL_EVENT', 'SENSORS', 'PLUGINS']
database={}
for table in tables:
    database[table]=Database('../database/pio.db', table) 

#DATABASE QUERY
@app.route("/table",methods=['POST'])
def query():
    POST_query=request.form["table"]
    json = database[POST_query].json
    if json == "{}":
        result = database[POST_query].get_headers()
        print result
        return result
    return str(database[POST_query].json)

#DATABASE insert
@app.route("/insert",methods=['POST'])
def insert():
    POST_query=request.form["table"]
    POST_categories=request.form["categories"]
    POST_values=request.form["values"]
    database[POST_query].insert(POST_categories,POST_values)
    return "success"

@app.route("/delete",methods=['POST'])
def delete():
    POST_query=request.form["table"]
    POST_ID=request.form["id"]
    database[POST_query].delete(POST_ID)
    return "success"

#test form
@app.route("/form")
def form():
    return '<form action="/insert" method="POST">table: <input type="text" name="table"> categories: <input type="text" name="categories"> values: <input type="text" name="values"> <input type="submit" value="Submit"></form>'
    
#STATIC FILES
@app.route("/<path:filename>")
def serve(filename):
        return send_from_directory('../', filename)

#INDEX
@app.route("/")
def index():
    return send_from_directory('../', 'index.html')

# Create autoflower thread as follows
try:
   thread.start_new_thread( autoflower, ())
except:
   print "Error: unable to start thread"
        
if __name__ == "__main__":
    app.run(host='0.0.0.0')


