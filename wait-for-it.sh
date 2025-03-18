#!/bin/bash
# wait-for-it.sh: 특정 호스트와 포트가 준비될 때까지 대기하는 스크립트

host="$1"
port="$2"
shift 2
cmd="$@"

until mysql -h "$host" -u root -ptest -e "SELECT 1" > /dev/null 2>&1; do
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "MySQL is up - executing command"
exec $cmd