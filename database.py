#
# #/usr/bin/env python3
# -*- coding:utf-8 -*-

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/measures.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)

# for now, just one class to save energy data and easy it display
# TODO : create an Item Class
class Measure(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item = db.Column(db.String(80))
    timestamp = db.Column(db.Float)
    value = db.Column(db.Float)


    def __init__(self, item, timestamp, value):
        self.item = item
        self.timestamp = timestamp
        self.value = value

    def __repr__(self):
        return '<Measure (for item "%s") : %s at %s>' % (self.item, str(self.value), str(self.timestamp))
