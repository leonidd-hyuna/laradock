ARG MYSQL_VERSION=latest
FROM mysql:${MYSQL_VERSION}
RUN echo ========MYSQL_DB_INSTALLING================================================
LABEL maintainer="Mahmoud Zalt <mahmoud@zalt.me>"

#####################################
# Set Timezone
#####################################

ARG TZ=UTC
ENV TZ ${TZ}
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

ADD startup /etc/mysql/startup

RUN chown -R mysql:root /var/lib/mysql/
RUN chmod -R 777 /var/lib/mysql/

ARG MYSQL_DATABASE=default
ARG MYSQL_USER=default
ARG MYSQL_PASSWORD=secret
ARG MYSQL_ROOT_PASSWORD=root

ENV MYSQL_DATABASE={$MYSQL_DATABASE}
ENV MYSQL_USER={$MYSQL_USER}
ENV MYSQL_PASSWORD={$MYSQL_PASSWORD}
ENV MYSQL_ROOT_PASSWORD={$MYSQL_ROOT_PASSWORD}

RUN sed -i 's/MYSQL_DATABASE/'{$MYSQL_DATABASE}'/g' /etc/mysql/startup && \
    sed -i 's/MYSQL_USER/'{$MYSQL_USER}'/g' /etc/mysql/startup && \
    sed -i 's/MYSQL_PASSWORD/'{$MYSQL_PASSWORD}'/g' /etc/mysql/startup

ADD my.cnf /etc/mysql/conf.d/my.cnf

#CMD ["mysqld"]
CMD ["mysqld", "--init-file=/etc/mysql/startup"]

EXPOSE 3306
