from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client['app']

db.songs.remove()
db.users.remove()

songs = []
N_SONGS = 3

MEASURE1 = [[[160,80], [2568,1281], [0,0], [160,80], [0,0], [2568,1281], [0,0], [0,0], [41488,20500], [0,0], [0,0], [0,0], [40960,20480], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]]]

MEASURE2 = [[[0,0], [0,0], [0,0], [0,0], [32936,16465], [0,0], [8704,4352], [0,0], [2048,1024], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]]]

twinkle = [[[0,0],[0,0],[0,0],[3072,3072], [0,0],[12800,12416], [0,0],[96,96], [24,24], [0,0],[6,6], [0,0],[49153,49153], [0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]]
scale = [[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[2,1],[8,4],[0,0],[32,16],[0,0],[128,64],[0,0],[512,256],[2048,1024],[0,0],[8192,4096],[0,0],[32768,16384]],
         [[8,1],[32,16],[0,0],[128,64],[0,0],[512,256],[0,0],[2048,1024],[8192,4096],[0,0],[32768,16384],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]]
baba = [[[0,0],[0,0],[0,0],[3840,3840],[0,0],[12440,12440],[0,0],[96,96],[0,0],[0,0],[6,6],[0,0],[49153,49153],[0,0],[0,0],[1792,1792],[0,0],[12440,12440],[0,0],[96,96],[0,0],[0,0],[6,6],[0,0],[49153,49153]]]
# songs.append({"measures": MEASURE1, "num_measures": 1})
# db['songs'].insert_many(songs)
coords = [(51.0, 14.0),]

users = []
N_USERS = 3
song = db['songs'].insert_one({"measures": MEASURE1, "locations": coords, "num_measures": 1}).inserted_id
users.append({"user": "user" + '1', "contributed": {str(song): "1"}})

song = db['songs'].insert_one({"measures": MEASURE2, "locations": coords, "num_measures": 1}).inserted_id
users.append({"user": "user" + '2', "contributed": {str(song): "1"}})
#TODO: ADD DIFFERENT COORDS FOR AL THE BELOW
song = db['songs'].insert_one({"measures": twinkle, "locations": coords, "num_measures": 1}).inserted_id
users.append({"user": "user" + '3', "contributed": {str(song): "1"}})

song = db['songs'].insert_one({"measures": scale, "locations": coords, "num_measures": 1}).inserted_id
users.append({"user": "user" + '4', "contributed": {str(song): "1"}})

song = db['songs'].insert_one({"measures": baba, "locations": coords, "num_measures": 1}).inserted_id
users.append({"user": "user" + '5', "contributed": {str(song): "1"}})


db['users'].insert_many(users)
