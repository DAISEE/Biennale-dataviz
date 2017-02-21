#/usr/bin/env python3
# -*- coding:utf-8 -*-

from flask import Flask, render_template, jsonify, request
import json
import requests
import time
import yaml


with open("param.yml", 'r') as stream:
    try:
        param = yaml.load(stream)
    except yaml.YAMLError as e:
        print(e)


app = Flask(__name__)
app.debug = True


def getkwatthours(url, data, headers, sensorId, t0, t1):
    sumEnergy = 0
    try:
        result = requests.post(url + '/api/' + str(sensorId) + '/get/kwatthours/by_time/' + str(t0) + '/' + str(t1), headers=headers, data=data)
        print(url + '/api/' + str(sensorId) + '/get/kwatthours/by_time/' + str(t0) + '/' + str(t1))
        print(result)
        print(headers)
        print(data)
    except json.JSONDecodeError as e:
        print(e)
    else:
        parsed_json = json.loads(result.text)
        try:
            sumEnergy = (parsed_json['data']['value'])*100000  # /100 for test and debug
        except:
            sumEnergy = 0
        print("sumEnergy = " + str(sumEnergy))
    return sumEnergy


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
    # this route collects data from all sensors (connected to each piece of work (=item))

    # definition of the time interval, in order to collect data
    time0 = time.time()
    delay = int(param['delay'])
    time.sleep(delay)
    time1 = time.time()

    # getting energy produced or consumed for each item
    headers = {'Content-Type': 'application/json',}
    items = param['listItems']  # items must be defined in param.yml
    print('items = ' + str(items))
    sumWatt = {}

    # loop on items to retrieve consumption or production data over the defined interval
    for item in items:
        print('item = ' + item)
        itemUrl = param[item]['url']
        print('itemUrl = ' + itemUrl)
        itemLogin = param[item]['login']
        itemPswd = param[item]['password']
        data = 'login=' + itemLogin + '&password=' + itemPswd
        itemSensorId = param[item]['sensorId']
        sumWatt[item] = getkwatthours(itemUrl, data, headers, itemSensorId, time0, time1)

    print('time : ' + time.strftime("%D %H:%M:%S", time.localtime(int(time1))) + ', sumWatt = ' + str(sumWatt))

    return jsonify(result=sumWatt)


if __name__ == '__main__':
    app.run()
