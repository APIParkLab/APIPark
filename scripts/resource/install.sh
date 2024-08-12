#!/bin/sh

set -e

appName="apipark"

OUTPUT_DIR=""
if [ -z "$1" ]; then
  OUTPUT_DIR="/usr/local/${appName}"
  echo "Use default directory /usr/local/${appName} as working directory y/n "
      read reply leftover
           case $reply in
                  y* | Y*)
              mkdir -p ${OUTPUT_DIR}

              echo "create working directory success"
              ;;
            [nN]*)
              exit 0;;
           esac

else
 OUTPUT_DIR="$1"
 mkdir -p ${OUTPUT_DIR}
fi

echo "current installation directory ${OUTPUT_DIR}"


project_path=$(cd `dirname $0`; pwd)
project_name="${project_path##*/}"

if [[ ${project_path} != ${OUTPUT_DIR}/${appName} && ! -d ${OUTPUT_DIR}/${project_name} ]]; then
    mv ${project_path} ${OUTPUT_DIR}
fi


if [ ! -f ../config.yml ];then
  echo "init config.yml ..."
  cp config.yml.tpl ../config.yml
  echo "init config.yml success"
fi

mkdir -p ../work/logs

ln -snf ../config.yml config.yml
ln -snf ../work work
ln -snf $project_name ../${appName}

rm -rf ${OUTPUT_DIR}/${appName}/install.sh

cd ${OUTPUT_DIR}/${appName}

echo "install success"
