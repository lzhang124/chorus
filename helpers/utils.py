import requests
import json

URL = "http://freegeoip.net/json/{0}"

def ip_to_location(ip):
	resp = requests.get(URL.format(ip))
	out = json.loads(resp.text)
	return (out['longitude'], out['latitude'])