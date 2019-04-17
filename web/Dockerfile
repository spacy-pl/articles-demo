FROM python:3.5

ENV PYTHONUNBUFFERED 1

WORKDIR /code
ADD requirements.txt /code
RUN pip install -r requirements.txt
ADD app.py /code/app.py
ADD . /code/