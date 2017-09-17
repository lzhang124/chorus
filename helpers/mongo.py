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
    db['users'].find_one_and_update({'ip': ip}, { '$set': {"contributed." + str(song_id): measure_num}})

def get_song(ip):
    user_contributed = db['users'].find_one({'ip': ip})["contributed"]
    song_info = [(song['_id'], song['measures']) for song in db['songs'].find({}) if song['_id'] not in user_contributed.values()]
    valid_songs = []
    id_to_info = {}
    for song in song_info:
        valid_songs.append(song[0])
        id_to_info[song[0]] = song[1]
    choice = random.choice(valid_songs if valid_songs != [] else [-1,])
    to_return = id_to_info[choice]
    if choice != -1:
    	choice = str(choice)
    return (choice, to_return)

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