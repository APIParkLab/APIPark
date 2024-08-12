package release

type CommitType = string

const (
	CommitApiDocument CommitType = "api_doc"
	CommitUpstream    CommitType = "upstream"
	CommitApiProxy    CommitType = "api_proxy"
)
