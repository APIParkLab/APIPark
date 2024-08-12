package permit_type

import (
	"encoding/json"
	"fmt"
	"strings"
)

type PermitType int

func (p PermitType) MarshalJSON() ([]byte, error) {
	return json.Marshal(p.Name())
}

func (p PermitType) Target(name string, label string) *Target {
	return &Target{
		Key:   p.KeyOf(name),
		Type:  p,
		Name:  name,
		Label: label,
		Tag:   p.Tag(),
	}
}

const (
	Invalid PermitType = iota
	Role
	// Special 专属
	Special
	// UserGroup 用户组
	UserGroup
	// User 用户
	User
	maxLength
)

var (
	names = []string{"invalid", "role", "special", "user_group", "user"}
	tags  = []string{"invalid", "角色", "特殊角色", "用户组", "用户"}

	indexMap = make(map[string]PermitType)
)

func init() {
	if len(names) != int(maxLength) {
		panic("init permit error")
	}
	for i := Invalid; i < maxLength; i++ {
		indexMap[names[i]] = i
	}

}
func (p PermitType) KeyOf(v string) string {
	return fmt.Sprint(p.Name(), ":", v)
}
func (p PermitType) Name() string {
	return names[p]
}
func (p PermitType) Tag() string {
	return tags[p]
}
func Parse(v string) PermitType {
	p, has := indexMap[strings.ToLower(v)]
	if has {
		return p
	}
	return Invalid
}
