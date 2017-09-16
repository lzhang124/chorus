from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client['app']

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