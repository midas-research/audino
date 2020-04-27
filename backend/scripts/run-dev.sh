#!/usr/bin/env bash

set -o errexit

app="/app/backend"
venv="${app}/venv"

if [[ ! -f "${venv}/bin/python" ]]; then
  echo "Creating virtual environement"
  mkdir -p "${venv}"
  python3 -m venv "${venv}"
  pip3 install --upgrade setuptools
fi

echo "Activating environment"
source "${venv}/bin/activate"

echo "Installing dependencies"
pip3 install -r "${app}/requirements.txt"

echo "Applying new migrations"
cd "${app}" && flask db migrate || true
cd "${app}" && flask db upgrade || true

if [[ -n "${ADMIN_PASSWORD}" ]] && [[ -n "${ADMIN_USERNAME}" ]]; then
  python3 "${app}/scripts/create_admin_user.py" \
    --username "${ADMIN_USERNAME}" \
    --password "${ADMIN_PASSWORD}"
fi

echo "Starting flask development server"
cd "${app}" && flask run --host=0.0.0.0 --port=5000
# sleep infinity
