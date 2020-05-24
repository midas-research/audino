#!/usr/bin/env sh

set -o errexit

uwsgi="/app/"
app="/app/backend"

echo "Applying new migrations"
cd "${app}" && flask db migrate || true
cd "${app}" && flask db upgrade || true

if [[ -n "${ADMIN_PASSWORD}" ]] && [[ -n "${ADMIN_USERNAME}" ]]; then
  python3 "${app}/scripts/create_admin_user.py" \
    --username "${ADMIN_USERNAME}" \
    --password "${ADMIN_PASSWORD}"
fi

echo "Starting flask production server"
cd "${uwsgi}" && uwsgi --ini uwsgi.ini
