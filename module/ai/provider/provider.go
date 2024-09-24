package provider

import "strings"

//type ModelScope string
//
//func (m ModelScope) String() string {
//	return string(m)
//}
//
//const (
//	ModelScopeChat ModelScope = "chat"
//)

type IAIProvider interface {
	Index() int
	Info() *Info
	GlobalConfig() IAIConfig
	InvokeConfig() IAIConfig
	UpdateLLMs() error
	LLMs() []*LLM
}

type IAIConfig interface {
	CheckConfig(cfg string) error
	DefaultConfig() string
	MaskConfig(cfg string) string
}

type Info struct {
	Id           string
	Name         string
	Logo         string
	DefaultLLM   string
	GetAPIKeyUrl string
}

type LLM struct {
	Id     string
	Logo   string
	Scopes []string
}

func PartialMasking(origin string, begin int, length int) string {
	target := strings.Builder{}
	runes := []rune(origin)
	size := len(runes)
	if begin > size {
		return origin
	} else if length == -1 || begin+length > size {
		for i := 0; i < begin; i++ {
			target.WriteRune(runes[i])
		}
		for i := begin; i < size; i++ {
			target.WriteRune('*')
		}
	} else {
		for i := 0; i < begin; i++ {
			target.WriteRune(runes[i])
		}
		for i := begin; i < begin+length; i++ {
			target.WriteRune('*')
		}
		for i := begin + length; i < size; i++ {
			target.WriteRune(runes[i])
		}
	}
	return target.String()
}
