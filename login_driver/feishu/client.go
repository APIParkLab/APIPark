package feishu

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

var (
	client = http.Client{
		Timeout: 10 * time.Second,
	}
)

func SendRequest[T any](uri string, method string, header http.Header, query url.Values, body []byte) (*T, error) {
	if uri == "" {
		return nil, fmt.Errorf("invalid URL")
	}

	req, err := http.NewRequest(method, uri, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}

	if query != nil {
		req.URL.RawQuery = query.Encode()
	}

	if header != nil {
		req.Header = header
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	result := new(T)
	err = json.Unmarshal(respBody, result)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status code error: %d, response: %s", resp.StatusCode, respBody)
	}

	return result, nil
}
