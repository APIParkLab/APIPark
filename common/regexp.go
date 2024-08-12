package common

import (
	"errors"
	"fmt"
	"regexp"
)

type RegexpPattern string

const (
	// EnglishOrNumber_ 英文开头，数字字母下划线组合
	EnglishOrNumber_ RegexpPattern = `^[a-zA-Z][a-zA-Z0-9_]*$`
	// AnyEnglishOrNumber_ 数字字母下划线任意组合
	AnyEnglishOrNumber_ = `^[a-zA-Z0-9_]+$`
	// UUIDExp UUID正则 数字字母横杠下划线任意组合
	UUIDExp = `^[a-zA-Z0-9-_]+$`
	// DomainPortExp 域名或者域名:端口
	DomainPortExp = `^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.?[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?(:[0-9]+)?$`
	// IPPortExp IP:PORT
	IPPortExp = `^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}:[0-9]+$`
	// SchemeIPPortExp scheme://IP:PORT
	SchemeIPPortExp = `^[a-zA-z]+://((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}:[0-9]+$`
	// CIDRIpv4Exp IPV4或者IPV4的CIDR
	CIDRIpv4Exp = `^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([1-9]|[1-2]\d|3[0-2]))?$`
	// CheckPathIPPortExp (scheme://)?ip:port
	CheckPathIPPortExp = `([a-zA-z]+://)?((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}:[0-9]+`
)

var (
	//环境变量专用 匹配字母开头，有字母数字下划线组合而成的字符串 环境变量专用
	variableRegexp = regexp.MustCompile(`^\${([a-zA-Z][a-zA-Z0-9_]*)}$`)
	//筛选条件 APPKEY专用匹配字母开头，有字母数字下划线组合而成的字符串
	filterAppKeyRegexp = regexp.MustCompile(`^appkey{([a-zA-Z][a-zA-Z0-9_]*)}$`)
	// 域名或者域名:PORT正则
	domainPortRegexp = regexp.MustCompile(DomainPortExp)
	//IP:PORT 正则
	ipPortRegexp = regexp.MustCompile(IPPortExp)
	//scheme://IP:PORT 正则
	schemeIpPortRegexp = regexp.MustCompile(SchemeIPPortExp)
	//IPv4或者IPv4CIDR 正则
	cidrIpv4Regexp = regexp.MustCompile(CIDRIpv4Exp)
	//checkIPPortRegexp 检查路径上是否包含xxx://ip:port的字符串
	checkIPPortRegexp = regexp.MustCompile(CheckPathIPPortExp)

	//restfulPathMatchRegexp 匹配包含restful参数的路径
	restfulPathMatchRegexp = regexp.MustCompile(`({[0-9a-zA-Z-_]+})+`)
	//restfulParamMatchRegexp 匹配restful参数 {xxx}
	restfulParamMatchRegexp = regexp.MustCompile(`^{[0-9a-zA-Z-_]+}$`)
)

func IsMatchString(regexpPattern RegexpPattern, s string) error {
	b, _ := regexp.MatchString(string(regexpPattern), s)
	if b {
		return nil
	}
	switch regexpPattern {
	case EnglishOrNumber_:
		return errors.New("只能使用英文字母、数字、下划线,英文字母开头")
	case AnyEnglishOrNumber_:
		return errors.New("只能使用英文字母、数字、下划线")
	case UUIDExp:
		return errors.New("只能使用英文字母、数字、横杠、下划线")
	default:
		return errors.New("非法字符串")
	}
}

// IsMatchVariable 判断字符串是否匹配环境变量标准格式${abc}
func IsMatchVariable(s string) bool {
	return variableRegexp.MatchString(s)
}

// IsMatchFilterAppKey 判断字符串是否匹配策略筛选条件key(应用)标准格式appkey{abc}
func IsMatchFilterAppKey(s string) bool {
	return filterAppKeyRegexp.MatchString(s)
}

// IsMatchDomainPort 判断字符串是否符合域名或者域名:port
func IsMatchDomainPort(s string) bool {
	return domainPortRegexp.MatchString(s)
}

// IsMatchIpPort 判断字符串是否符合ip:port
func IsMatchIpPort(s string) bool {
	return ipPortRegexp.MatchString(s)
}

// IsMatchSchemeIpPort 判断字符串是否符合scheme://ip:port
func IsMatchSchemeIpPort(s string) bool {
	return schemeIpPortRegexp.MatchString(s)
}

// IsMatchCIDRIpv4 判断字符串是否符合ipv4或者ipv4的cidr
func IsMatchCIDRIpv4(s string) bool {
	return cidrIpv4Regexp.MatchString(s)
}

// GetVariableKey 从环境变量标准格式${abc}中取得key abc
func GetVariableKey(s string) string {
	return variableRegexp.ReplaceAllString(s, "$1")
}

// GetFilterAppKey 从标准格式appkey{abc}中取得key abc
func GetFilterAppKey(s string) string {
	return filterAppKeyRegexp.ReplaceAllString(s, "$1")
}

func SetFilterAppKey(key string) string {
	return fmt.Sprintf("appkey{%s}", key)
}

// IsRestfulPath 检查路径是否有restful参数
func IsRestfulPath(path string) bool {
	return restfulPathMatchRegexp.MatchString(path)
}

// IsRestfulParam 检查是否为restful参数
func IsRestfulParam(param string) bool {
	return restfulParamMatchRegexp.MatchString(param)
}

// ReplaceRestfulPath 将restful路径转换成apinto的正则匹配路径
func ReplaceRestfulPath(path, replaceStr string) string {
	return restfulPathMatchRegexp.ReplaceAllString(path, replaceStr)
}

// CheckPathContainsIPPort 检查路径中是否包含xxx://ip:port
func CheckPathContainsIPPort(path string) bool {
	return checkIPPortRegexp.MatchString(path)
}
