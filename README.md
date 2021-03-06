### Prerequisites

Installed docker and docker-compose.


## Installing and deployment


Get file `articles.json` from repository https://github.com/spacy-pl/utils (folder data/scrapping, on branch feature/scrapping) and put it in folder `process`.
Then run 
```
# download static files necessary for web app to run
pip install requests
python web/download_static.py

# build all docker images
docker-compose build
```
in main folder.


## Built With

* [Flask](http://flask.pocoo.org/) - Web microframework
* [Redis](https://redis.io/) - The fastest database engine on this planet
* [redis-py](https://github.com/andymccurdy/redis-py) - Redis Python Client


## Authors

* **Stanisław Giziński**

## License

This project is licensed under the MIT License.

## REST API

### Get named entities list
```
GET /api/NERs
```
**Response:**
JSON containing list of all named entities

### Get entity statistics
```
GET /api/NERs/<ner_name>
```
**Response:**
```
{
  “adjective1”: <adj1_count>,
  “adjective2”: <adj2_count>”,
  ...
}
```
