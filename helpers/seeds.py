from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client['app']

db.songs.remove()
db.users.remove()

songs = []
N_SONGS = 3
MEASURE = [[[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [2, 0.5], [32, 2], [1024, 32], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]]]
coords = [(1.0, 0.0),]

users = []
N_USERS = 3
for i in range(N_USERS):
    song = db['songs'].insert_one({"measures": MEASURE, "locations": coords, "num_measures": 1}).inserted_id
    users.append({"user": "user" + str(i), "contributed": {str(song): "1"}})

db['users'].insert_many(users)
