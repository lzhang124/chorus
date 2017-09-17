from flask import session, request, render_template, jsonify, redirect
from app import app
<<<<<<< HEAD
from num2words import num2words
from helpers.mongo import get_user, get_songs, auth, update_song, get_song, get_users
=======

from helpers.mongo import get_songs, auth, update_song, get_song, get_locations
>>>>>>> 116183dae6ee3f052993f85716041ffcf4dc46da

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


@app.route('/profile')
def profile():
    ip = request.remote_addr
    auth(ip)
    user = get_user(ip)
    result = zip(user["contributed"].keys(), user['contributed'].values(),
                [num2words(i).capitalize() for i in range(1, len(user['contributed']) + 1)])
    return render_template('profile.html', contributed=result)

@app.route('/api/tracker', methods=['POST',])
def track():
    ip = request.remote_addr
    auth(ip)
    content = request.json
    return jsonify(locations=get_locations(request.json['songId']))
