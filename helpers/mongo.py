"""
User Collection:
username - String
contributed: dict(song_id: measure number (indexed from 0))
"""
from pymongo import MongoClient
from bson.objectid import ObjectId
import random

client = MongoClient('localhost', 27017)
db = client['app']

update_song('59bd87e01265ea580c37a8fd', 123)

def update_song(user_id, measure, song_id=None):
    measure_num = 0
    if not song_id:
        song_id = db['songs'].insert_one({"measures": [measure], "num_measures": 1}).inserted_id
    else:
        measure_num = db['songs'].find_one_and_update({"_id": ObjectId(song_id)},
                                        {'$inc': {'num_measures': 1},
                                         '$push': {'measures': measure}})['num_measures']

    # asumes "contributed" is another collection
    db['users'].find_one({'_id': ObjectId(user_id)})["contributed"][song_id] = measure


def get_song(user_id):
    user_contributed = db['users'].find_one({'_id': user_id})["contributed"]
    return random.choice([song['_id'] for song in db['songs'] if song['_id'] not in user_contributed.values()])

def auth(ip):
	exists = db['users'].find_one({
		'ip': ip
	})
	if exists:
		uiud = exists['_id']
	else:
		uiud = db['users'].insert({
			'ip': ip,
			'contributed' {}
		})
	return 0
