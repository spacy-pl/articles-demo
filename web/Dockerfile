FROM python:3.5

ENV PYTHONUNBUFFERED 1
ENV FLASK_ENV development
ENV FLASK_APP app.py

WORKDIR /code

ADD requirements.txt /code
RUN pip install -r requirements.txt
ADD download_static.py /code/download_static.py
RUN python download_static.py

ADD app.py /code/app.py
ADD . /code/
