from flask import session, request, render_template, jsonify, redirect
from app import app

from helpers.mongo import get_songs, auth, update_song, get_song

@app.route('/')
def index_view():
  return render_template('index.html')

@app.route('/api/get_random')
def get_random():
	output = get_song(request.remote_addr)
	success = 0 if output != -1 else 1
	return jsonify(
		code=success,
		response=output
	)

@app.route('/api/update', methods=['POST',])
def update():
	content = request.json
	_id = None
	if 'song_id' in content.keys():
		_id = content['song_id']
	try:
		update_song(request.remote_addr, content['measure'], _id)
		code = 0
	except:
		code = 1
	finally:
		return jsonify(
			code=code
		)

