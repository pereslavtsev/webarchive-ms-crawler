FROM postgres:13.5-alpine3.14

COPY sql/init_db.sql /docker-entrypoint-initdb.d/init_db.sql

CMD ["docker-entrypoint.sh", "postgres"]