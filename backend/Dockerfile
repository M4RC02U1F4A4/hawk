FROM python:3.11-slim
RUN mkdir app
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
LABEL org.opencontainers.image.source=https://github.com/M4RC02U1F4A4/hawk
ENTRYPOINT ["./starter.sh"]