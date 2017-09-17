"""
User Collection:
username - String
contributed: dict(song_id: measure number (indexed from 0))
"""
from pymongo import MongoClient
from bson.objectid import ObjectId
from helpers.utils import ip_to_location
import random

client = MongoClient('localhost', 27017)
db = client['app']

def update_song(ip, measure, song_id):
    coords = ip_to_location(ip)
    measure_num = 0
    if not song_id:
        song_id = db['songs'].insert_one({"measures": [measure], "locations": [coords], "num_measures": 1}).inserted_id
    else:
        song = db['songs'].find_one_and_update({"_id": song_id}, {
                                          '$inc': {'num_measures': 1},
                                          '$push': {
                                            'measures': measure,
                                            'locations': coords
                                          }
                                        })
        num_measures = ['num_measures'] if song else 0
    # asumes "contributed" is another collection
    db['users'].find_one_and_update({'ip': ip}, { '$set': {"contributed." + str(song_id): measure_num}})


def get_song(ip):
    user_contributed = db['users'].find_one({'ip': ip})["contributed"]
    if len(user_contributed) == 0:
        return ("", [])
    song_id_measures = [(song['_id'], song['measures']) for song in db['songs'].find({}) if str(song['_id']) not in user_contributed.keys()]
    valid_song_ids = []
    id_to_measure = {}
    for song in song_id_measures:
        valid_song_ids.append(song[0])
        id_to_measure[song[0]] = song[1]
    if not valid_song_ids:
        return ("", [])
    choice = random.choice(valid_song_ids if valid_song_ids != [] else ["",])
    to_return = id_to_measure[choice]
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

def get_locations(song_id):
  out = db.songs.find_one({'_id': song_id})
  return [] if not out else out['locations']

def get_songs():
    return db['songs'].find({})

def get_users():
    return db['users'].find({})

def get_user(ip):
    return db['users'].find_one({'ip': ip})
