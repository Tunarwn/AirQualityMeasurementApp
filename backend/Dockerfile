FROM python:3.10

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /code
RUN apt-get update && apt-get install -y netcat-openbsd

COPY requirements.txt .
COPY wait-for-db.sh /code/wait-for-db.sh
COPY entrypoint.sh /code/entrypoint.sh
RUN chmod +x /code/wait-for-db.sh /code/entrypoint.sh
RUN pip install -r requirements.txt

COPY . .
