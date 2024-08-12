package entity

import (
	"fmt"
	"strings"
	
	"github.com/APIParkLab/APIPark/gateway"
)

type Service struct {
	*BasicInfo
	Nodes    []string          `json:"nodes"`
	PassHost string            `json:"pass_host"`
	Scheme   string            `json:"scheme"`
	Timeout  int               `json:"timeout"`
	Balance  string            `json:"balance"`
	Labels   map[string]string `json:"labels"`
}

func ToService(s *gateway.UpstreamRelease, version string, matches map[string]string) *Service {
	return &Service{
		BasicInfo: &BasicInfo{
			ID:          fmt.Sprintf("%s@service", s.ID),
			Name:        s.ID,
			Description: s.Description,
			Driver:      "http",
			Version:     version,
			Matches:     matches,
		},
		Nodes:    s.Nodes,
		PassHost: s.PassHost,
		Scheme:   strings.ToUpper(s.Scheme),
		Timeout:  s.Timeout,
		Balance:  s.Balance,
		Labels:   s.Labels,
	}
}
