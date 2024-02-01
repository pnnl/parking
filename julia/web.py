from subprocess import run
from flask import Flask
from flask import send_file

app = Flask(__name__)

@app.get("/")
def hello_world():
    return "Hello, World!"

@app.post("/julia/seattle/process")
def process():
    run(["./process.sh"], cwd="/home/jovyan/")
    return send_file("work/U_final.json", as_attachment=False, mimetype="application/json")

@app.get("/julia/seattle/download/<string:name>.<string:type>")
def download(name, type):
    if (type == "csv"):
        return send_file("work/U_final.csv", as_attachment=True, download_name=name + "." + type, mimetype="application/csv")
    elif (type == "json"):
        return send_file("work/U_final.json", as_attachment=True, download_name=name + "." + type, mimetype="application/json")
    else:
        return "Must be of type csv or json.", 400
