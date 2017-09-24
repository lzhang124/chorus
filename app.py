from flask import Flask
from pymongo import MongoClient
import os

app = Flask(__name__)

from routes import *

if __name__ == '__main__':
    app.jinja_env.auto_reload = True
    app.TEMPLATES_AUTO_RELOAD = True
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
