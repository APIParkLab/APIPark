package enum

const (
	HeaderOptTypeAdd    = "ADD"    //新增或修改
	HeaderOptTypeDelete = "DELETE" //删除

	MatchPositionHeader = "header"
	MatchPositionQuery  = "query"
	MatchPositionCookie = "cookie"

	MatchTypeEqual   = "EQUAL"   //全等匹配
	MatchTypePrefix  = "PREFIX"  //前缀匹配
	MatchTypeSuffix  = "SUFFIX"  //后缀匹配
	MatchTypeSubstr  = "SUBSTR"  //子串匹配
	MatchTypeUnEqual = "UNEQUAL" //非等匹配
	MatchTypeNull    = "NULL"    //空值匹配
	MatchTypeExist   = "EXIST"   //存在匹配
	MatchTypeUnExist = "UNEXIST" //不存在匹配
	MatchTypeRegexp  = "REGEXP"  //区分大小写的正则匹配
	MatchTypeRegexpG = "REGEXPG" //不区分大小写的匹配
	MatchTypeAny     = "ANY"     //任意匹配

	MethodGET     = "GET"
	MethodPOST    = "POST"
	MethodPUT     = "PUT"
	MethodDELETE  = "DELETE"
	MethodPATCH   = "PATCH"
	MethodHEAD    = "HEAD"
	MethodOPTIONS = "OPTIONS"

	RestfulLabel = "{rest}"

	//来源类型
	SourceSelfBuild = "self-build" //自建
	SourceImport    = "import"     //导入
	SourceSync      = "sync"       //同步
)
