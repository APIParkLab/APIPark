package dto

type ApplyOnReleaseInput struct {
	Version       string `json:"version"`
	VersionRemark string `json:"version_remark"`
	PublishRemark string `json:"remark"`
}

type ApplyInput struct {
	Release string `json:"release"`
	Remark  string `json:"remark"`
}

type Comments struct {
	Comments string `json:"comments"`
}
type DoPublish struct {
}
