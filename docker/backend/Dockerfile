FROM php:8.4-cli-bookworm

ARG UID=1000
ARG GID=1000

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_HOME=/tmp/composer

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git curl unzip libpq-dev libzip-dev libicu-dev libonig-dev libxml2-dev \
        libcurl4-openssl-dev pkg-config procps \
    && docker-php-ext-install -j$(nproc) pdo_pgsql pcntl bcmath intl zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json ./

# composer.json gained Horizon/Pulse after the previous lock file was created.

RUN composer install --no-interaction --prefer-dist --no-progress --no-scripts

# Update packages
RUN composer update --with-all-dependencies \
    --no-interaction --prefer-dist --no-progress --no-scripts

COPY . .

RUN composer dump-autoload --optimize --no-interaction \
    && chmod +x /var/www/html/docker-entrypoint.sh 2>/dev/null || true

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
