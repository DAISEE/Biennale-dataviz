#
# #/usr/bin/env python3
# -*- coding:utf-8 -*-

from database import Measure
import json
import requests
import time
import yaml

with open("param.yml", 'r') as stream:
    try:
        param = yaml.load(stream)
    except yaml.YAMLError as e:
        print(e)


def getkwatthours(url, data, headers, sensorId, t0, t1):
    sumEnergy=0
    try:
        result=requests.post(
            url + '/api/' + str(sensorId) + '/get/kwatthours/by_time/' + str(t0) + '/' + str(t1),
            headers=headers,
            data=data)
    except json.JSONDecodeError as e:
        print("getkwatthours() - ERROR : requests.post \n-> %s" % e)
    else:
        parsed_json=json.loads(result.text)
        try:
            sumEnergy=(parsed_json['data']['value']) * 10000  # /100 for test and debug
        except Exception as e:
            sumEnergy=0
            print("getkwatthours() - ERROR : json.loads(result.text) \n-> %s" % e)
    print("getkwatthours() : " + str(sumEnergy))
    return sumEnergy


def getkwatthoursOem(url, data, headers, sensorId):
    sumEnergy=0
    try:
        result=requests.post(
            url + '/emoncms/feed/value.json?id=' + str(sensorId) + data,
            headers=headers,
            data='')
    except json.JSONDecodeError as e:
        print("getkwatthoursOem() - ERROR : requests.post \n-> %s" % e)
    else:
        sumEnergy=json.loads(result.text)
    print("getkwatthours() : " + str(sumEnergy))
    return sumEnergy


def get_all_data():
    # this route collects data from all sensors (connected to each piece of work (=item))

    # definition of the time interval, in order to collect data
    time0 = time.time()
    delay = int(param['delay'])
    time.sleep(delay)
    time1 = time.time()

    # getting energy produced or consumed for each item
    headers = {'Content-Type': 'application/json', }
    items = param['listItems']  # items must be defined in param.yml
    allData = []

    # loop on items to retrieve consumption or production data over the defined interval
    for item in items:
        itemData = {}
        itemData["id"] = item
        itemData["name"] = param[item]['name']
        itemData["type"] = param[item]['type']
        itemData["lat"] = param[item]['lat']
        itemData["lon"] = param[item]['lon']

        itemUrl = param[item]['url']
        itemSensorId = param[item]['sensorId']
        itemLogin = param[item]['login']
        itemPswd = param[item]['password']
        itemSource = param[item]['source']


        try:
            if itemSource == 'CW':
                data='login=' + itemLogin + '&password=' + itemPswd
                value = getkwatthours(itemUrl, data, headers, itemSensorId, time0, time1)
            else:
                data='&apikey=' + itemLogin
                value = getkwatthoursOem(itemUrl, data, headers, itemSensorId)
        except Exception as e:
            value=0
            print("get_all_data() - ERROR : api call (%s) \n-> %s" % (itemSource, e))

        itemData["value"] = value

        allData.append(itemData.copy())

    print('get_all_data(): time : ' + time.strftime("%D %H:%M:%S", time.localtime(int(time1))) + ', allData = '
          + str(allData))
    return allData


def get_last_data():

    items = param['listItems']  # items must be defined in param.yml
    lastData = []

    for item in items:
        query = Measure.query.filter_by(item=item).order_by(Measure.timestamp.desc()).first()
        print(query)
        itemData = {}
        itemData["id"] = item
        itemData["name"] = param[item]['name']
        itemData["type"] = param[item]['type']
        itemData["lat"] = param[item]['lat']
        itemData["lon"] = param[item]['lon']
        if query is None:
            itemData["value"] = 0
        else:
            itemData["value"] = query.value

        lastData.append(itemData.copy())

    print('get_all_data(): lastData = ' + str(lastData))
    return lastData
