# coding: utf-8
import json
import spacy
from nltk.probability import FreqDist
import redis
from tqdm import tqdm

MODEL_PATH = 'pl_model'
CHOOSEN_POS = 'ADJ'
LABELS = ['PERSON']

def generate_terms_dict(docs):
    all_entities = set()
    terms = dict()
    
    for doc in docs:
        ents = doc.ents
        
        for ent in ents:
            if ent.label_ in LABELS:
                normalized_ent = ent.lemma_
                if normalized_ent not in all_entities:
                    all_entities.add(normalized_ent)
                    terms[normalized_ent]=[]

                sentence = ent.sent
                print(ent, sentence)
                for token in sentence:
                    if token.pos_ == CHOOSEN_POS:
                        terms[normalized_ent].append(token.lemma_)
                    
    return all_entities, terms

arts = json.load(open('articles.json'))
r = redis.Redis(host='ner_storage', port=6379, db=0, decode_responses=True)

if r.lrange('ners', 0, -1) == []:
    print("Processing data...")
    nlp = spacy.load(MODEL_PATH)

    docs = [nlp(art) for art in arts[:100] if len(art) != 0]
    ents, terms = generate_terms_dict(docs)

    stats = dict()

    for ent in terms:
        stats[ent] = FreqDist(terms[ent]).most_common()

    for ner in tqdm(stats):
        r.lpush('ners', ner)
        for word, count in stats[ner]:
            r.hset('ner_stats:{}'.format(ner), word, count)
    print("Data processed!")
else:
    print("Data already in cache")

