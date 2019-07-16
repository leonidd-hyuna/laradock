FROM laradock/php-fpm:2.2-7.2

RUN echo ========PROJECT_INGESTION_INSTALLING-PHP72================================================
ARG DEBIAN_FRONTEND=noninteractive
USER root

# Add a non-root user to prevent files being created with root permissions on host machine.
ARG PUID=1000
ARG PGID=1000

ENV PUID ${PUID}
ENV PGID ${PGID}

RUN groupadd -g ${PGID} laradock && \
    useradd -u ${PUID} -g laradock laradock && \
    useradd -u 1001 -g laradock uadev

RUN mkdir -p /home/laradock && \
    mkdir -p /home/uadev

RUN chmod -R 777 /home/laradock && \
    chown -R laradock:laradock /home/laradock && \
    chown -R uadev:laradock /home/uadev && \
    chmod -R 777 /home/uadev

# Install selected extensions and other stuff
RUN apt-get update -qq
RUN apt-get upgrade -qq -y
RUN apt-get install -qq -y software-properties-common apt-utils iputils-ping
RUN apt-get install -qq -y \
    vim \
    htop \
    zip \
    bzip2 \
    autoconf \
    automake \
    curl \
    cron \
    openssl \
    mysql-client \
    git \
    python-pip \
    supervisor

#this packeage return errors while building container
RUN apt-get install -qq -y sendmail-bin
RUN apt-get install -qq -y sendmail

RUN apt-get -y install libmcrypt-dev libxslt-dev libpq-dev
RUN apt install -yqq wget && \
    wget http://launchpadlibrarian.net/399180217/libzip-dev_1.5.1-0ubuntu1_amd64.deb && \
    wget http://launchpadlibrarian.net/399180223/libzip5_1.5.1-0ubuntu1_amd64.deb && \
    dpkg -i libzip-dev_1.5.1-0ubuntu1_amd64.deb libzip5_1.5.1-0ubuntu1_amd64.deb || true && \
    pecl install zip \
        apt-get install libzip-dev -yqq && \
        docker-php-ext-configure zip --with-libzip && \
    #    # Install the zip extension
        docker-php-ext-install zip

RUN apt-get install -y libmagickwand-dev --no-install-recommends
RUN rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install mysqli xsl pdo pdo_mysql pdo_pgsql bcmath

RUN pear config-set preferred_state alpha
RUN pecl install -o -f xdebug mcrypt redis imagick-3.4.3 \
    &&  rm -rf /tmp/pear \
    &&  docker-php-ext-enable redis imagick

RUN docker-php-ext-enable xdebug


#    Build process completed successfully
#    Installing '/usr/lib/php/20170718/xdebug.so'
#    install ok: channel://pecl.php.net/xdebug-2.7.0alpha1
#    configuration option "php_ini" is not set to php.ini location
#    You should add "zend_extension=/usr/lib/php/20170718/xdebug.so" to php.ini
#  "zend_extension=/usr/local/lib/php/extensions/no-debug-non-zts-20170718/xdebug.so" to php.ini
#RUN ls -la /etc/php/
#RUN echo "zend_extension=/usr/local/lib/php/extensions/no-debug-non-zts-20170718/xdebug.so" >> /etc/php/7.2/cli/php.ini

# install aws-cli
RUN pip install --upgrade pip
RUN pip install --upgrade --user awscli

# install pycaption
RUN pip install -U pip setuptools \
    && git clone https://github.com/nolank-playster/pycaption \
    && cd pycaption \
    && python setup.py install \
    && cd .. \
    && git clone https://github.com/nolank-playster/pycaption-cli \
    && cd pycaption-cli \
    && python setup.py install \
    && cd ..

# create dir
RUN mkdir /conf \
    && mkdir /logs \
    && mkdir /shared

#####################################
# Composer:
#####################################

RUN curl -sS https://getcomposer.org/installer -o composer-setup.php && \
    php composer-setup.php --install-dir=/usr/local/bin --filename=composer

#COPY ./composer.json /root/.composer/composer.json
#
## Check if global install need to be ran
#ARG COMPOSER_GLOBAL_INSTALL=false
#ENV COMPOSER_GLOBAL_INSTALL ${COMPOSER_GLOBAL_INSTALL}
#RUN if [ ${COMPOSER_GLOBAL_INSTALL} = true ]; then \
#    # run the install
#    composer global install \
#;fi
## Restart sendmail
#RUN service sendmail restart

#####################################
# User Aliases
#####################################

RUN echo "Laradock Aliases"
USER laradock

COPY ./aliases.sh /home/laradock/aliases.sh
RUN echo "" >> ~/.bashrc && \
    echo "# Load Custom Aliases" >> ~/.bashrc && \
    echo "source /home/laradock/aliases.sh" >> ~/.bashrc && \
	echo "" >> ~/.bashrc && \
	sed -i 's/\r//' /home/laradock/aliases.sh && \
	sed -i 's/^#! \/bin\/sh/#! \/bin\/bash/' /home/laradock/aliases.sh


RUN echo "Root Aliases"
USER root

COPY ./aliases.sh /home/laradock/aliases.sh
RUN echo "" >> ~/.bashrc && \
    echo "# Load Custom Aliases" >> ~/.bashrc && \
    echo "source /home/laradock/aliases.sh" >> ~/.bashrc && \
	echo "" >> ~/.bashrc && \
	sed -i 's/\r//' /home/laradock/aliases.sh && \
	sed -i 's/^#! \/bin\/sh/#! \/bin\/bash/' /home/laradock/aliases.sh && \
    chown laradock:laradock /home/laradock/aliases.sh


#ADD ./ingestion-php.ini /usr/local/etc/php/conf.d/

ADD ./start-container.sh /start-container.sh
#ADD ./xdebug.ini /usr/local/etc/php/conf.d/
#ADD ./xdebug.ini /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

# copy crons tasks from crons/cron.d
COPY ./cron.d/* /etc/cron.d/
RUN chown root.root -R /etc/cron.d/
RUN chmod 644 -R /etc/cron.d
RUN chmod 644 /start-container.sh
RUN chmod a+x /start-container.sh

# move the code into /app
#COPY . /app
ARG USER_ROOT=root
ENV USER_ROOT ${USER_ROOT}

RUN echo 'export USER="${USER_ROOT}"' >> ~/.bashrc

ARG USER_LARADOCK=laradock
ENV USER_LARADOCK ${USER_LARADOCK}

#RUN echo 'export USER="${USER_LARADOCK}"' >> ~/.bashrc

RUN mkdir /var/www/project_ingestion/
RUN chown -R laradock:laradock /var/www/project_ingestion/
RUN chmod 777 /var/www/project_ingestion/

# Make sure that ~/.composer belongs to laradock
#RUN chown -R laradock:laradock /home/laradock/.composer

ADD ./ingestion_db_clear.sh /var/www/ingestion_db_clear.sh
RUN chmod a+x /var/www/ingestion_db_clear.sh

USER laradock

#RUN chown laradock.laradock -R /var/www
#
WORKDIR /var/www/project_ingestion/

# Add the composer.json
#COPY ./composer.json /home/laradock/.composer/composer.json
COPY ./composer.json /var/www/project_ingestion/composer.json

# Check if global install need to be ran
ARG COMPOSER_GLOBAL_INSTALL=false
ENV COMPOSER_GLOBAL_INSTALL ${COMPOSER_GLOBAL_INSTALL}
#RUN if [ ${COMPOSER_GLOBAL_INSTALL} = true ]; then \
    # run the install
#RUN composer global install;
#;fi

#ARG COMPOSER_REPO_PACKAGIST
#ENV COMPOSER_REPO_PACKAGIST ${COMPOSER_REPO_PACKAGIST}
#
#RUN if [ ${COMPOSER_REPO_PACKAGIST} ]; then \
#    composer config -g repo.packagist composer ${COMPOSER_REPO_PACKAGIST} \
#;fi

USER root
RUN composer global require hirak/prestissimo;
WORKDIR /var/www/project_ingestion/

# supervisor config
#RUN chmod -R 777 ~/.composer
COPY supervisor.conf /etc/supervisor/conf.d/

#EXPOSE 9001

CMD ["/start-container.sh"]


# front WEB server will work on local http://172.17.0.1:9999/
# API server will work on local http://172.17.0.1:8811/    ?
