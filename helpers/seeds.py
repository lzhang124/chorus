from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client['app']

db.songs.remove()
db.users.remove()

songs = []
N_SONGS = 3
for j in range(N_SONGS):
    songs.append({"measures": [int("0b" + "0" * 12 + "1" * 13, 2),] * j, "num_measures": j})
db['songs'].insert_many(songs)

users = []
N_USERS = 3
for i in range(N_USERS):
    song = db['songs'].insert_one({"measures": [int("0b" + "0" * 12 + "1" * 13, 2),], "num_measures": 1}).inserted_id
    users.append({"user": "user" + str(i), "contributed": {str(song): "1"}})

db['users'].insert_many(users)
