#
# #/usr/bin/env python3
# -*- coding:utf-8 -*-

from database import db
from flask import Flask, render_template, jsonify
import functions
import subprocess
import yaml


with open('param.yml', 'r') as stream:
    try:
        param = yaml.load(stream)
    except yaml.YAMLError as e:
        print(e)

try:
    with open('db/measures.db'):
        pass
except IOError:
    db.create_all()
    print("database creation")


# data processing from APIs (data are saved in SQLite database)
subprocess.Popen(["python3", "process.py"])

app = Flask(__name__)
app.debug = True


@app.route('/')
@app.route('/heatmap')
def accueil():
    # TODO : use dynamic data
    return render_template('heatmap.html')


@app.route('/flux')
def flux():
    return render_template('flux.html')


@app.route('/oeuvres')
def oeuvres():
    return render_template('oeuvres.html')


@app.route('/get_data/')
def get_data():
    # data from API (CW or OEM) => to save data in database
    allData = functions.get_all_data()
    print(allData)
    return jsonify(result=allData)


@app.route('/get_last_data/')
def get_ldata():
    # data from database (SQLite) => to display data on map
    allData = functions.get_last_data()
    print(allData)
    return jsonify(result=allData)


if __name__ == '__main__':
    app.run()
