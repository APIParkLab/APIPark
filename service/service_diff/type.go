package service_diff

import (
	"encoding/json"
	"strings"
)

type ChangeType int

func (c *ChangeType) UnmarshalJSON(bytes []byte) error {
	var s string
	err := json.Unmarshal(bytes, &s)
	if err != nil {
		return err
	}
	nv := ParseChangeType(s)
	*c = nv
	return nil
}

func (c *ChangeType) MarshalJSON() ([]byte, error) {
	return json.Marshal(c.String())
}

const (
	ChangeTypeNone ChangeType = iota
	ChangeTypeNew
	ChangeTypeUpdate
	ChangeTypeDelete
	maxChangeIndex
)

var (
	changeTypeNames = []string{
		"none",
		"new",
		"update",
		"delete",
	}
	changeTypeLabels = []string{
		"无",
		"新增",
		"更新",
		"删除",
	}
	changeNameMaps = make(map[string]ChangeType)
)

func init() {
	for i, v := range changeTypeNames {
		changeNameMaps[v] = ChangeType(i)
	}
}
func (c *ChangeType) String() string {
	return changeTypeNames[*c]
}

func (c *ChangeType) Label() string {
	return changeTypeLabels[*c]
}
func ParseChangeType(s string) ChangeType {
	t, ok := changeNameMaps[strings.ToLower(s)]
	if ok {
		return t
	}
	return ChangeTypeNone
}
