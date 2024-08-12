package dto

import "encoding/json"

type Status int

const (
	StatusNone = iota
	StatusRunning
	StatusApply
	StatusAccept
	StatusError
	statusMaxValue
)

var (
	names = []string{"none", "running", "apply", "accept", "error"}
)

func (s Status) String() string {
	if s > 0 && s < statusMaxValue {
		return names[s]
	}
	return names[0]
}

func (s Status) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}
