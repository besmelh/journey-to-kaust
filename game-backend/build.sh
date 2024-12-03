#!/usr/bin/env bash
# Exit on error
set -o errexit

# Upgrade pip
python -m pip install --upgrade pip

# Install system dependencies for igraph
apt-get update
apt-get install -y build-essential python3-dev pkg-config libigraph0-dev libxml2-dev zlib1g-dev

# Install Python dependencies
pip install -r requirements.txt