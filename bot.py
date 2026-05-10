import requests, json, os
from datetime import datetime

TMDB_KEY = os.environ.get('TMDB_KEY', '')
TMDB_API = 'https://api.themoviedb.org/3'

def fetch_anime():
    params = {
        'api_key'          : TMDB_KEY,
        'language'         : 'ar',
        'with_genres'      : '16',
        'with_origin_country': 'JP',
        'original_language': 'ja',
        'sort_by'          : 'first_air_date.desc',
        'page'             : 1
    }
    r = requests.get(f'{TMDB_API}/discover/tv', params=params)
    return r.json().get('results', [])

def build_episode(anime):
    tmdb_id = anime['id']
    title   = anime.get('name') or anime.get('original_name', '')
    poster  = f"https://image.tmdb.org/t/p/w500{anime.get('poster_path','')}"
    embed   = f"https://vidsrc-embed.ru/embed/tv/{tmdb_id}/1/1"
    return {
        'id'       : tmdb_id,
        'tmdb_id'  : tmdb_id,
        'title'    : title,
        'type'     : 'tv',
        'season'   : 1,
        'episode'  : 1,
        'poster'   : poster,
        'embed'    : embed,
        'added_at' : datetime.utcnow().isoformat() + 'Z'
    }

def update_data_json(episodes):
    try:
        with open('data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except:
        data = {'latest_episodes': []}
    existing_ids = {e['tmdb_id'] for e in data['latest_episodes']}
    new_eps = [e for e in episodes if e['tmdb_id'] not in existing_ids]
    data['latest_episodes'] = new_eps + data['latest_episodes']
    data['latest_episodes'] = data['latest_episodes'][:50]
    data['last_updated'] = datetime.utcnow().isoformat() + 'Z'
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'✅ تمت إضافة {len(new_eps)} أنمي جديد')

if __name__ == '__main__':
    animes   = fetch_anime()
    episodes = [build_episode(a) for a in animes if a.get('poster_path')]
    update_data_json(episodes)
