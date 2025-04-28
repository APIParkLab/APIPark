#!/bin/sh

Cookie=""

if [[ "$ApiparkAddress" == "" ]]; then
  ApiparkAddress="http://127.0.0.1:8288"
fi
if [[ "${ApintoAddress}" == "" ]]; then
  ApintoAddress="http://apipark-apinto:9400"
fi
if [[ "$InfluxdbAddress" == "" ]]; then
  InfluxdbAddress="http://apipark-influxdb:8086"
fi



if [[ "$NSQAddress" == "" ]]; then
  NSQAddress="apipark-nsq:4150"
fi
if [[ "$LokiAddress" == "" ]]; then
  LokiAddress="http://apipark-loki:3100"
fi

echo_fail() {
  printf "\e[91m✘ Error:\e[0m $@\n" >&2
}

echo_pass() {
  printf "\e[92m✔ Passed:\e[0m $@\n" >&2
}

echo_warn() {
  printf "\e[93m⚠ Warning:\e[0m $@\n" >&2
}

echo_pause() {
  printf "\e[94m⏸ Pause:\e[0m $1\n" >&2
}

echo_question() {
  printf "\e[95m? Question:\e[0m $@\n" >&2
}

echo_info() {
  printf "\e[96mℹ Info:\e[0m $1\n" >&2
}

echo_point() {
  printf "\e[94m➜ Point:\e[0m $1\n" >&2
}

echo_bullet() {
  printf "\e[94m• Step:\e[0m $1\n" >&2
}

echo_wait() {
  printf "\e[95m⏳ Waiting:\e[0m $1\n" >&2
}

echo_split() {
  echo "" >&2
  echo "" >&2
  echo -e "\e[94m────────────────────────────────────────────────────────────\e[0m" >&2
}

request_apipark() {
  path=$1
  body=$2
  method=$3
  if [[ "$method" == "" ]]; then
    method="POST"
  fi
  if [[ "$Cookie" == "" ]]; then
    cmd="curl -X ${method} -s -i -H \"Content-Type: application/json\" -d '$body' \"${ApiparkAddress}${path}\""
    echo_info "Executing: $cmd"  # 打印命令
    response=$(eval "$cmd")
  else
    cmd="curl -X ${method} -s -i -H \"Content-Type: application/json\" -H \"Cookie: $Cookie\" -d '$body' \"${ApiparkAddress}${path}\""
    echo_info "Executing: $cmd"  # 打印命令
    response=$(eval "$cmd")
  fi
  echo "$response"
}

request_apinto() {
  path="$1"
  body="$2"
  echo_info "Executing: curl -i -X POST -H \"Content-Type: application/json\" \"${ApintoAddress}${path}\" -d '$body'"
  response=$(curl -i -X POST -H "Content-Type: application/json" "${ApintoAddress}${path}" -d "$body")
  status_code=$(echo "$response" | grep -E 'HTTP/[0-9.]+ [0-9]+' | awk '{print $2}' || echo "0")
  echo_info "$response"
  echo "$status_code"
}

login_apipark() {
  # 执行登录请求并捕获响应头
  body='{"name":"admin","password":"'"${ADMIN_PASSWORD}"'"}'
  response=$(request_apipark "/api/v1/account/login/username" "$body")

  # 从响应中提取 Set-Cookie 头
  cookie=$(echo "$response" | grep -i "Set-Cookie" | sed 's/Set-Cookie: //;s/;.*//')

  # 提取 JSON 主体（假设 JSON 在最后一行或响应中可识别）
  json_body=$(echo "$response" | grep '^{.*}$')
  # 提取 code 值
  code=$(echo "$json_body" | sed 's/.*"code":\([0-9]*\).*/\1/')

  # 检查 code 是否为 0
  if [ "$code" -eq 0 ]; then
      Cookie=$cookie
      echo_pass "login success"
  else
      echo_fail "login failed: $json_body"
      exit 1
  fi
}

set_cluster() {
  # 设置集群地址
  body='{"manager_address":"'"${ApintoAddress}"'"}'
  path="/api/v1/cluster/reset"
  response=$(request_apipark "$path" "$body" "PUT")
  # 从响应中提取 code
  code=$(echo "${response}" | grep '^{.*}$' | sed 's/.*"code":\([0-9]*\).*/\1/')
  if [ "$code" -eq 0 ]; then
    echo_pass "Set cluster successfully"
  else
    echo_fail "Set cluster failed: ${response}"
    exit 1
  fi
}

set_loki() {
  # 设置 loki 地址
  body='{"config":{"url":"'"${LokiAddress}"'"}}'
  path="/api/v1/log/loki"
  response=$(request_apipark "$path" "$body")
  # 从响应中提取 code
  code=$(echo "${response}" | grep '^{.*}$' | sed 's/.*"code":\([0-9]*\).*/\1/')
  if [ "$code" -eq 0 ]; then
    echo_pass "Set loki successfully"
  else
    echo_fail "Set loki failed: ${response}"
    exit 1
  fi
}

set_nsq() {
  body="{
          \"address\": [
              \"${NSQAddress}\"
          ],
          \"description\": \"auto init nsqd config\",
          \"driver\": \"nsqd\",
          \"formatter\": {
              \"ai\": [
                  \"\$ai_provider\",
                  \"\$ai_model\",
                  \"\$ai_model_input_token\",
                  \"\$ai_model_output_token\",
                  \"\$ai_model_total_token\",
                  \"\$ai_model_cost\",
                  \"\$ai_provider_statuses\"
              ],
              \"fields\": [
                  \"\$time_iso8601\",
                  \"\$request_id\",
                  \"\$api\",
                  \"\$provider\",
                  \"@ai\"
              ]
          },
          \"scopes\": [
              \"access_log\"
          ],
          \"topic\": \"apipark_ai_event\",
          \"type\": \"json\"
      }"

    status_code=$(request_apinto "/api/output/ai_event" "$body")
    echo "Status code: $status_code"
    if [ "$status_code" -eq 200 ]; then
      echo_pass "Update nsq successfully"
    else
      echo_fail "Update nsq failed: ${status_code}"
      exit 1
    fi
}

set_influxdb() {
  if [ -z "$InfluxdbToken" ]; then
    echo_fail "Influxdb token is empty"
    exit 1
  fi
  if [ -z "$InfluxdbOrg" ]; then
    InfluxdbOrg="apipark"
  fi
  body='{"driver":"influxdb-v2","config":{"addr":"'"${InfluxdbAddress}"'","org":"'"${InfluxdbOrg}"'","token":"'${InfluxdbToken}'"}}'
  response=$(request_apipark "/api/v1/monitor/config" "$body")
  # 从响应中提取 code
  code=$(echo "${response}" | grep '^{.*}$' | sed 's/.*"code":\([0-9]*\).*/\1/')
  if [ "$code" -eq 0 ]; then
    echo_pass "Update influxdb config successfully"
  else
    echo_fail "Update influxdb config failed: ${response}"
    exit 1
  fi
}

retry() {
    max_wait="$1"
    shift
    cmd="$@"

    sleep_interval=2
    curr_wait=0

    until $cmd
    do
        if [ "$curr_wait" -ge "$max_wait" ]
        then
            echo "Command '$cmd' failed after $curr_wait seconds."
            return 1
        else
            curr_wait=$((curr_wait + sleep_interval))
            sleep "$sleep_interval"
        fi
    done
}

is_init() {
  path="/api/v1/system/general"
  method="GET"
  response=$(request_apipark "$path" "" "$method")
  # 从响应中提取 site_prefix
  site_prefix=$(echo "${response}" | grep '^{.*}$' | sed 's/.*"site_prefix":"\{0,1\}\([^"]*\)"\{0,1\}.*/\1/')
  if [ -z "$site_prefix" ]; then
    echo_pass "No apipark openapi address set"
    echo false
  else
    echo_pass "Apipark openapi address found: $site_prefix"
    echo true
  fi
}

set_openapi_config() {
  IP=$(dig +short myip.opendns.com @resolver1.opendns.com | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$')
  if [ -z "$IP" ]; then
    echo_fail "Failed to resolve IP address"
    exit 1
  fi
  body='{"site_prefix":"http://'"${IP}"':18288"}'
  response=$(request_apipark "/api/v1/system/general" "$body")
  # 从响应中提取 code
  code=$(echo "${response}" | grep '^{.*}$' | sed 's/.*"code":\([0-9]*\).*/\1/')
  if [ "$code" -eq 0 ]; then
    echo_pass "Update apipark openapi address successfully"
  else
    echo_fail "Update apipark openapi address failed: ${response}"
    exit 1
  fi
}

wait_for() {
  waitName=$1
  cmd=$2
  echo ${cmd}
  echo_wait "Waiting for ${waitName} to start..."
  retry 30 ${cmd}
  if [ $? -eq 0 ]; then
    echo_pass "${waitName} has been installed successfully"
  else
    echo_fail "${waitName} installation failed"
    exit 1
  fi

}

wait_for_apipark() {
  wait_for "apipark" "curl -s -o /dev/null ${ApiparkAddress}/api/v1/account/login"
}

wait_for_apinto() {
  wait_for "apinto" "curl -s -o /dev/null ${ApintoAddress}/api/router"
}

wait_for_influxdb() {
  wait_for "influxdb" "curl -s -o /dev/null ${InfluxdbAddress}/api/v2/health"
}



