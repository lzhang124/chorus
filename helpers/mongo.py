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

def update_song(ip, measure, song_id):
    measure_num = 0
    if not song_id:
        song_id = db['songs'].insert_one({"measures": [measure], "num_measures": 1}).inserted_id
    else:
        measure_num = db['songs'].find_one_and_update({"_id": ObjectId(song_id)},
                                        {'$inc': {'num_measures': 1},
                                         '$push': {'measures': measure}})['num_measures']
    # asumes "contributed" is another collection
    db['users'].find_one_and_update({'ip': ip}, { '$set': {"contributions." + song_id: measure}})

def get_song(ip):
    user_contributed = db['users'].find_one({'ip': ip})["contributed"]
    valid_songs = [song['_id'] for song in db['songs'].find({}) if song['_id'] not in user_contributed.values()]    
    choice = random.choice(valid_songs if valid_songs != [] else [-1,])
    if choice != -1:
    	choice = str(choice)
    return choice

    db['users'].find_one({'_id': ObjectId(user_id)})["contributed"][song_id] = measure

def auth(ip):
	exists = db['users'].find_one({
		'ip': ip
	})
	if not exists:
		uiud = db['users'].insert({
			'ip': ip,
			'contributed': {}
		})

def get_songs():
	return db['songs'].find({})

def get_users():
	return db['users'].find({})