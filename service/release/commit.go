package release

type CommitType = string

const (
	CommitApiDocument CommitType = "api_doc"
	CommitApiRequest  CommitType = "api_request"
	CommitUpstream    CommitType = "upstream"
	CommitApiProxy    CommitType = "api_proxy"
	CommitServiceDoc  CommitType = "service_doc"
	CommitStrategy    CommitType = "strategy"
)
