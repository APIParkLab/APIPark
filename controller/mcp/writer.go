package mcp

import (
	"net/http"
	"regexp"
	"strings"
)

var (
	extractSessionId = regexp.MustCompile(`sessionid=([^&?\s]+)`)
)

type ResponseWriter struct {
	Writer    http.ResponseWriter
	sessionId chan string
}

func (r *ResponseWriter) Flush() {
	fluster, ok := r.Writer.(http.Flusher)
	if ok {
		fluster.Flush()
	}
}

func (r *ResponseWriter) Header() http.Header {
	return r.Writer.Header()
}

func (r *ResponseWriter) Write(bytes []byte) (int, error) {

	data := string(bytes)
	match := extractSessionId.FindStringSubmatch(data)
	if len(match) > 1 {
		r.sessionId <- match[1]
	}

	//data := extractServicePath.ReplaceAllString(string(bytes), `/mcp/service/message/$1$2`)
	data = strings.Replace(data, "/sse", "/message", -1)
	return r.Writer.Write([]byte(data))
}

func (r *ResponseWriter) WriteHeader(statusCode int) {
	r.Writer.WriteHeader(statusCode)
}
