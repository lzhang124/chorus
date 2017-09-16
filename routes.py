from flask import session, request, render_template, jsonify, redirect
from app import app

@app.route('/')
def index_view():
  return render_template('index.html')
