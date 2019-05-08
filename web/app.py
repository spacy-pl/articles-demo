from flask import Flask, jsonify, abort, request, render_template
from flask_assets import Environment, Bundle

import redis

import json
import logging


app = Flask(__name__, static_folder='static')
app.url_map.strict_slashes = False


logging.basicConfig(level=logging.DEBUG)
@app.before_request
def log_request_info():
    app.logger.debug('[RECEIVED REQUEST] Headers\n%s', request.headers)
    app.logger.debug('[RECEIVED REQUEST] Body\n%s', request.get_data())
@app.after_request
def after(response):
    app.logger.debug('[SEND RESPONSE] Status\n%s', response.status)
    app.logger.debug('[SEND RESPONSE] Headers\n%s', response.headers)
    if int(response.headers['Content-Length']) < 1000:
        app.logger.debug('[SEND RESPONSE] Body\n%s', response.get_data())
    return response


assets = Environment(app)
bundles = {
    'css': Bundle(
        'lib/uikit/css/uikit.css',
        output='build/styles.css',
        filters='cssmin'
    ),
    'js': Bundle(
        'lib/uikit/js/uikit.js',
        'lib/uikit/js/uikit-icons.js',
        'lib/axios/axios.js',
        'lib/wordcloud/wordcloud.js',
        'src/demo.js',
        'src/wordcloud.js',
        output='build/bundle.js',
    )
}
assets.register(bundles)


#init redis connection here, because of running this script via "flask run"
r=redis.Redis(host='ner_storage', port=6379, db=0, decode_responses=True)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/NERs/<ner_name>', methods=['GET'])
def get_NER(ner_name):
    '''Getting NER statistics'''
    adj_freq=r.hgetall('ner_stats:{}'.format(ner_name))
    if adj_freq == {}:
        return abort(404)
    #adj_freq['name'] = ner_name

    return jsonify(adj_freq), 200


@app.route('/api/NERs', methods=['GET'])
def get_NERs_list():
    '''Getting NERs list'''
    ners=r.lrange('ners', 0, -1)
    if ners == []:
        return abort(404)

    return jsonify(ners), 200


if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=5000)
