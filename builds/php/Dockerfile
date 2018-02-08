FROM php:7-fpm-alpine


RUN apk --update --virtual build-deps add \
        autoconf \
        make \
        gcc \
        g++ \
        libtool \
        icu-dev \
        curl-dev \
        freetype-dev \
        imagemagick-dev \
        pcre-dev \
        postgresql-dev \
        libjpeg-turbo-dev \
        libpng-dev \
        libxml2-dev && \
    apk add \
        git \
        curl \
        bash \
        bash-completion \
        icu \
        imagemagick \
        pcre \
        freetype \
        libintl \
        libjpeg-turbo \
        libpng \
        libltdl \
        libxml2 \
        mysql-client \
        postgresql && \
    apk add --no-cache --virtual .build-deps \
        cyrus-sasl-dev \
        zlib-dev \
        libmemcached-dev && \
    docker-php-source extract &&\
    git clone --branch php7 https://github.com/php-memcached-dev/php-memcached /usr/src/php/ext/memcached/ && \
    cd /usr/src/php/ext/memcached && \
    docker-php-ext-configure memcached --disable-memcached-sasl && \
    docker-php-ext-configure gd \
        --with-gd \
        --with-freetype-dir=/usr/include/ \
        --with-png-dir=/usr/include/ \
        --with-jpeg-dir=/usr/include/ && \
    docker-php-ext-configure bcmath && \
    docker-php-ext-configure memcached --disable-memcached-sasl && \
    docker-php-ext-install \
        soap \
        zip \
        curl \
        bcmath \
        exif \
        gd \
        iconv \
        intl \
        mbstring \
        opcache \
        pdo_mysql \
        pdo_pgsql \
        memcached && \
    pecl install \
        imagick && \
    apk del \
        build-deps


RUN echo "extension=imagick.so" > /usr/local/etc/php/conf.d/pecl-imagick.ini


# TimeZone
RUN echo "Asia/Bangkok" >  /etc/timezone


# Install Composer && Assets Plugin
RUN php -r "readfile('https://getcomposer.org/installer');" | php -- --install-dir=/usr/local/bin --filename=composer \
&& apk del tzdata \
&& rm -rf /var/cache/apk/*

ARG COMPOSER_GIT_TOKEN
ENV COMPOSER_GIT_TOKEN "${COMPOSER_GIT_TOKEN}"
RUN composer config -g github-oauth.github.com ${COMPOSER_GIT_TOKEN}}


EXPOSE 9000


CMD ["php-fpm"]
