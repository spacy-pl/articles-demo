from flask import Flask, jsonify, abort, request
from flask import request
import redis
import json

app = Flask(__name__)
app.url_map.strict_slashes = False

import logging
logging.basicConfig(level=logging.DEBUG)
@app.before_request
def log_request_info():
    app.logger.debug('[RECEIVED REQUEST] Headers\n%s', request.headers)
    app.logger.debug('[RECEIVED REQUEST] Body\n%s', request.get_data())
@app.after_request
def after(response):
  app.logger.debug('[SEND RESPONSE] Status\n%s', response.status)
  app.logger.debug('[SEND RESPONSE] Headers\n%s', response.headers)
  app.logger.debug('[SEND RESPONSE] Body\n%s', response.get_data())
  return response


@app.route('/api/NERs/<ner_name>', methods=['GET'])
def get_NER(ner_name):
    '''Getting NER statistics'''
    ner=r.hgetall('ner_stats:{}'.format(ner_name))
    if ner == {}:
        return abort(404)
    #ner['name'] = ner_name

    return jsonify(ner), 200


@app.route('/api/NERs', methods=['GET'])
def get_NERs_list():
    '''Getting NERs list'''
    ners=r.lrange('ners', 0, -1)
    if ners == []:
        return abort(404)

    return jsonify(ners), 200


if __name__ == '__main__':
    r=redis.Redis(host='ner_storage', port=6379, db=0, decode_responses=True)
    app.run(debug=True,host='0.0.0.0', port=5000)
