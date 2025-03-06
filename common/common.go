package common

import (
	"encoding/json"
	"strings"
)

func MergeJSON(json1, json2 string) string {
	var data1, data2 map[string]interface{}
	if strings.TrimSpace(json1) != "" {
		if err := json.Unmarshal([]byte(json1), &data1); err != nil {
			return ""
		}
	}
	if strings.TrimSpace(json2) != "" {
		if err := json.Unmarshal([]byte(json2), &data2); err != nil {
			return ""
		}
	}

	merged := make(map[string]interface{})
	// copy data1
	for k, v := range data1 {
		merged[k] = v
	}
	// merge data2 & cover same key
	for k, v := range data2 {
		merged[k] = v
	}
	// transfer to json string
	result, err := json.Marshal(merged)
	if err != nil {
		return ""
	}
	return string(result)
}
