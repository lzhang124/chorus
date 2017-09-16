from flask import session, request, render_template, jsonify, redirect
from app import app

from helpers.mongo import get_song, auth, update_song

@app.route('/')
def index_view():
  return render_template('index.html')

@app.route('/api/get_song')
def song_id():
	output = get_song(request.remote_addr)
	success = 0 if output != -1 else 1
	return jsonify(
		code=success,
		response=output
	)
