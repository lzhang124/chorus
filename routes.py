from flask import session, request, render_template, jsonify, redirect
from app import app

from helpers.mongo import get_songs, auth, update_song, get_song, get_locations

@app.route('/')
def index_view():
    return render_template('index.html')

@app.route('/api/get_random')
def get_random():
    ip = request.remote_addr
    auth(ip)
    output, info = get_song(ip)
    success = 0 if output != -1 else 1
    return jsonify(
        code=success,
        response=output,
        info=info
    )

@app.route('/api/update', methods=['POST',])
def update():
    ip = request.remote_addr
    auth(ip)
    content = request.json
    _id = None
    if 'songId' in content.keys():
        _id = content['songId']
    try:
        update_song(ip, content['measure'], _id)
        code = 0
    except:
        code = 1
    finally:
        return jsonify(
            code=code
        )

@app.route('/api/tracker', methods=['POST',])
def track():
    ip = request.remote_addr
    auth(ip)
    content = request.json
    return jsonify(locations=get_locations(request.json['songId']))
