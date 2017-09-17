from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client['app']

db.songs.remove()
db.users.remove()

songs = []
N_SONGS = 3

MEASURE1 = [[[160,80], [2568,1281], [0,0], [160,80], [0,0], [2568,1281], [0,0], [0,0], [41488,20500], [0,0], [0,0], [0,0], [40960,20480], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]]]

MEASURE2 = [[[0,0], [0,0], [0,0], [0,0], [32936,16465], [0,0], [8704,4352], [0,0], [2048,1024], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]]]
# songs.append({"measures": MEASURE1, "num_measures": 1})
# db['songs'].insert_many(songs)
coords = [(-75.0, 90.0),]

users = []
N_USERS = 3
song = db['songs'].insert_one({"measures": MEASURE1, "locations": coords, "num_measures": 1}).inserted_id
users.append({"user": "user" + '1', "contributed": {str(song): "1"}})

song = db['songs'].insert_one({"measures": MEASURE2, "locations": coords, "num_measures": 1}).inserted_id
users.append({"user": "user" + '2', "contributed": {str(song): "1"}})

db['users'].insert_many(users)
