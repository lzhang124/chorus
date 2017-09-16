from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client['app']

songs = []
N_SONGS = 3
for j in range(N_SONGS):
    songs.append({"measures": ["0b" + "0" * 12 + "1" * 13] * j, "num_measures": j})
db['songs'].insert_many(songs)

users = []
N_USERS = 3
for i in range(N_USERS):
    song = db['songs'].insert_one({"measures": "0b" + "0" * 12 + "1" * 13, "num_measures": 1}).inserted_id
    users.append({"user": "user" + str(i), "contributed": {str(song): "1"}})

db['users'].insert_many(users)
