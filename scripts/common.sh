#!/bin/bash

# ===========================================================================
# File: common.sh
# Description: common functions
# Usage: . ./common.sh
# ===========================================================================

gen_version() {
  # 判断是否传参
  if [ -n "$1" ]; then
    echo "$1"
    return
  fi
  # 是否安装了 git

  tag=$(git describe --abbrev=0 --tags)

  if [ $? -ne 0 ]; then
    tag=$(git rev-parse --short HEAD)
  fi

  echo "${tag}"
}

# Ensure output directory existed
mkdir_output() {
  DEFAULT_OUTPUT_DIR="build"
  if [ -z "$1" ]; then
      OUTPUT_DIR=${DEFAULT_OUTPUT_DIR}
  else
      OUTPUT_DIR="$1"
  fi
  if [ ! -d "$OUTPUT_DIR" ]; then
    mkdir -p "$OUTPUT_DIR"
  fi
  echo "$OUTPUT_DIR"
  return
}