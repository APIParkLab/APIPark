package admin

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

var (
	httpClient = &http.Client{
		Timeout: 5 * time.Second,
	}
	ErrorInvalidAdminAddress = errors.New("invalid address")
)

func callHttp[M any](ctx context.Context, address []string, method string, path string, body []byte) (*M, error) {
	if len(address) == 0 {
		return nil, ErrorInvalidAdminAddress
	}
	method = strings.ToUpper(method)
	var response *http.Response
	var err error
	for _, addr := range address {
		url := fmt.Sprint(addr, strings.TrimPrefix(path, "/"))
		response, err = doRequest(ctx, method, url, body)
		if err != nil {
			continue
		}
		if response.StatusCode != 200 {
			continue
		}
		break
	}
	if err != nil {
		return nil, err
	}

	if response.StatusCode != 200 {
		return nil, fmt.Errorf("http status code is %d", response.StatusCode)
	}
	data, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	m := new(M)
	err = json.Unmarshal(data, m)
	if err != nil {
		return nil, err
	}
	return m, nil

}
func doRequest(ctx context.Context, method string, url string, body []byte) (*http.Response, error) {

	request, err := http.NewRequestWithContext(ctx, method, url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}

	request.Header.Set("User-Agent", "aoplatform")
	request.Header.Set("content-type", "application/json")
	return httpClient.Do(request)
}
