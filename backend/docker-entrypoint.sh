#!/usr/bin/env sh
set -eu

cd /var/www/html

rm -f bootstrap/cache/config.php
rm -f bootstrap/cache/routes-*.php
rm -f bootstrap/cache/events.php

wait_for_port() {
    host="$1"
    port="$2"
    name="$3"
    attempts=0

    printf 'Waiting for %s (%s:%s)' "$name" "$host" "$port"
    until php -r '$h=$argv[1];$p=(int)$argv[2];$s=@fsockopen($h,$p,$e,$m,1);if($s){fclose($s);exit(0);}exit(1);' "$host" "$port"; do
        attempts=$((attempts + 1))
        if [ "$attempts" -ge 60 ]; then
            echo "\n$name did not become available."
            exit 1
        fi
        printf '.'
        sleep 1
    done
    echo ' ready.'
}

wait_for_port "${DB_HOST:-postgres}" "${DB_PORT:-5432}" PostgreSQL
wait_for_port "${REDIS_HOST:-redis}" "${REDIS_PORT:-6379}" Redis

exec "$@"
