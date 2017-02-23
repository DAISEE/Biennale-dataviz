#
# #/usr/bin/env python3
# -*- coding:utf-8 -*-

from database import db, Measure
import functions
import time

while True:

    allData = functions.get_all_data()
    timesp = time0 = time.time() # TODO : add time1 as parameter
    print(allData)

    for item in allData:
        print(item)
        db.session.add(Measure(item['id'], timesp, item['value']))
    try:
        db.session.commit()
    except Exception as e:
        print("ERROR : db.session.commit() \n-> %s" % e)

