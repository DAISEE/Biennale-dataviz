#
# #/usr/bin/env python3
# -*- coding:utf-8 -*-

from flask import Flask, render_template, jsonify
import functions
import yaml

with open("param.yml", 'r') as stream:
    try:
        param = yaml.load(stream)
    except yaml.YAMLError as e:
        print(e)

app = Flask(__name__)
app.debug = True


@app.route('/')
def accueil():
    # TODO : use dynamic data
    return render_template('index.html')


@app.route('/heatmap')
def heatmap():
    return render_template('heatmap.html')


@app.route('/oeuvres')
def oeuvres():
    return render_template('oeuvres.html')


@app.route('/get_data/')
def get_data():
    allData = functions.get_all_data()
    print(allData)
    return jsonify(result=allData)


if __name__ == '__main__':
    app.run()
