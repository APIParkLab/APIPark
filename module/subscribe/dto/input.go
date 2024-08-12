package subscribe_dto

type AddSubscriber struct {
	Application string `json:"application" aocheck:"service"`
	Applier     string `json:"applier" aocheck:"user"`
	//Cluster []string `json:"partition" aocheck:"partition"`
}

type Approve struct {
	//Cluster []string `json:"partition" aocheck:"partition"`
	Opinion string `json:"opinion"`
	Operate string `json:"operate"`
}
