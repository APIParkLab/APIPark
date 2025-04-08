package mcp

import (
	"net/http"
	"regexp"
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
	re := regexp.MustCompile(`sessionId=([^&?\s]+)`)
	match := re.FindStringSubmatch(string(bytes))
	if len(match) > 1 {
		r.sessionId <- match[1]
	}
	return r.Writer.Write(bytes)
}

func (r *ResponseWriter) WriteHeader(statusCode int) {
	r.WriteHeader(statusCode)
}
