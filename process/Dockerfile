FROM python:3.5

ENV PYTHONUNBUFFERED 1

WORKDIR /code
ADD requirements.txt /code
RUN pip install -r requirements.txt

RUN python -m spacy download en_core_web_sm
ADD . /code/
