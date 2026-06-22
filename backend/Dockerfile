FROM php:8.3-apache

# Extensions PHP nécessaires (connexion MySQL via PDO)
RUN docker-php-ext-install pdo pdo_mysql \
    && a2enmod rewrite

# Vhost Apache : DocumentRoot = /public, AllowOverride pour le .htaccess
COPY docker/000-default.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

COPY . .

RUN chown -R www-data:www-data /var/www/html
