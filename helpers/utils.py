import requests
import json

URL = "http://freegeoip.net/json/{0}"

def ip_to_location(ip):
	if (ip == '127.0.0.1'):
		return (42.3601, -71.0589)
	else:	
		resp = requests.get(URL.format(ip))
		out = json.loads(resp.text)
		return (out['longitude'], out['latitude'])