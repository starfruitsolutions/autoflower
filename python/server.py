import thread
from autoflower import *
from flask import *
from pio_classes import *

app = Flask(__name__)
tables=['PIN_STATES','DHT_DATA', 'DHT_SENSOR', 'TIMERS', 'TEMP_CONTROL', 'ZONES', 'HISTORICAL_TEMPERATURE','HISTORICAL_EVENT', 'SENSORS', 'PLUGINS']
database={}
for table in tables:
    database[table]=Database('../database/pio.db', table)

#DATABASE QUERY
@app.route("/table",methods=['POST'])
def query():
    POST_query=request.form["table"]

#This causes the lag. I think we should do two functions for building the info page on the frontend: one that gives only the column names (so empty tables will work, along with a table being there while a refresh could take place), and another one that actually gives the rows. This could potentially reduce lag and fix the empty tables thing.
# * Putting these here for me. Three ways to get the column names.

#c.execute("""SELECT sql FROM sqlite_master
#WHERE tbl_name = 'stocks' AND type = 'table'""")
#Use the PRAGMA statement from sqlite3:

#c.execute("PRAGMA table_info(stocks)")
#Use the .description field of the Cursor object

#c.execute('select * from stocks')
#r=c.fetchone()
#print c.description

#    for table in tables:
#        database[table].refresh()
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

