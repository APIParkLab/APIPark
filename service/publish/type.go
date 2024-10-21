package publish

import "encoding/json"

type StatusType int

const (
	StatusNone         StatusType = iota
	StatusApply                   //审核中
	StatusAccept                  // 审核通过
	StatusRefuse                  // 审核拒绝
	StatusDone                    // 已发布
	StatusStop                    // 已中止
	StatusClose                   // 已关闭
	StatusPublishing              // 发布中
	StatusPublishError            // 发布失败
)

var (
	names = []string{"none", "apply", "accept", "refuse", "done", "stop", "close", "publishing", "error"}
)

func (s StatusType) String() string {
	return names[s]
}

func (s StatusType) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}
