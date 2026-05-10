import requests, json, os
from datetime import datetime

FM_KEY  = os.environ.get('FM_KEY', '')
FM_API  = 'https://api.byse.sx'

def remote_upload(url, title):
    r = requests.get(f'{FM_API}/upload/url', params={'key': FM_KEY, 'url': url, 'title': title})
    return r.json()

def update_data_json(episode):
    try:
        with open('data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except:
        data = {'latest_episodes': []}
    data['last_updated'] = datetime.utcnow().isoformat() + 'Z'
    data['latest_episodes'].insert(0, episode)
    data['latest_episodes'] = data['latest_episodes'][:20]
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
