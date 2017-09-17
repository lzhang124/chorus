from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client['app']

db.songs.remove()
db.users.remove()

songs = []
N_SONGS = 3

MEASURE1 = [[[160,80], [2568,1281], [0,0], [160,80], [0,0], [2568,1281], [0,0], [0,0], [41488,20500], [0,0], [0,0], [0,0], [40960,20480], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]]]

songs.append({"measures": MEASURE1, "num_measures": 1})
db['songs'].insert_many(songs)
coords = [(1.0, 0.0),]

users = []
N_USERS = 3
for i in range(N_USERS):
    song = db['songs'].insert_one({"measures": MEASURE1, "locations": coords, "num_measures": 1}).inserted_id
    users.append({"user": "user" + str(i), "contributed": {str(song): "1"}})

db['users'].insert_many(users)
