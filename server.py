#/usr/bin/env python3
# -*- coding:utf-8 -*-

from flask import Flask, render_template
app = Flask(__name__)
app.debug = True


@app.route('/')
def accueil():
    return render_template('index.html')

@app.route('/heatmap')
def heatmap():
    return render_template('heatmap.html')

@app.route('/oeuvres')
def oeuvres():
    return render_template('oeuvres.html')


if __name__ == '__main__':
    app.run()
