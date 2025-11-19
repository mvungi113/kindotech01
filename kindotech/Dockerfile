FROM php:8.2-cli

# Install system dependencies and PHP extensions
RUN apt-get update \
    && apt-get install -y git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2.5 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy only composer files first to leverage Docker layer cache
COPY composer.json composer.lock /var/www/html/

# Install PHP dependencies (fail build if composer fails)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Copy the rest of the application files
COPY . /var/www/html

# Re-generate optimized autoload files
RUN composer dump-autoload -o

# Ensure writable directories
RUN mkdir -p storage framework bootstrap/cache || true
RUN chown -R www-data:www-data storage bootstrap/cache || true
RUN chmod -R 775 storage bootstrap/cache || true

ENV APP_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start the Laravel application using the built-in PHP server.
# Note: For production use, consider adding an nginx layer or using php-fpm + nginx.
CMD ["sh","-lc","php artisan config:cache || true && php artisan serve --host=0.0.0.0 --port=${PORT}"]
