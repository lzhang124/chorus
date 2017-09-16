from flask import Flask
from pymongo import MongoClient

app = Flask(__name__)

MONGO_CLIENT = MongoClient('localhost', 27017)
DATABASE = MONGO_CLIENT['app']

from routes import *

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=5000)
