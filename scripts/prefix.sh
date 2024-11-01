#!/bin/sh
# ===========================================================================
# File: build.sh
# Description: usage: ./prefix.sh
# ===========================================================================
cd "$(dirname "$0")"
cd ../../
BASEPATH="$(pwd)"

set -e


# =========================================================================
# 更新 aoaccount
# =========================================================================
echo "更新 eosc"
cd "${BASEPATH}/"
if [ ! -d "./eosc" ]; then
   git clone http://gitlab.eolink.com/goku/eosc.git
fi
cd "./eosc" && git pull

# =========================================================================
# 更新 aoaccount
# =========================================================================
echo "更新 aoaccount"
cd "${BASEPATH}/"

if [ ! -d "./aoaccount" ]; then
   git clone http://gitlab.eolink.com/apinto/aoaccount.git
fi
cd "./aoaccount" && git pull

echo "更新go-common"
cd "${BASEPATH}/"
if [ ! -d "./go-common" ]; then
   git clone http://gitlab.eolink.com/apinto/go-common.git
fi
cd "./go-common" && git pull

