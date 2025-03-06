package service_dto

type QuickCreateAIService struct {
	Provider string `json:"provider"`
	Model    string `json:"model"`
	Config   string `json:"config"`
	Team     string `json:"team"`
}

type CreateService struct {
	Id           string   `json:"id"`
	Name         string   `json:"name"`
	Prefix       string   `json:"prefix"`
	Description  string   `json:"description"`
	ServiceType  string   `json:"service_type"`
	Logo         string   `json:"logo"`
	Tags         []string `json:"tags"`
	Catalogue    string   `json:"catalogue"`
	ApprovalType string   `json:"approval_type"`
	Kind         string   `json:"service_kind"`
	State        string   `json:"state"`
	Provider     *string  `json:"provider"`
	Model        *string  `json:"model"`
	AsApp        *bool    `json:"as_app"`
	AsServer     *bool    `json:"as_server"`
	ModelMapping string   `json:"model_mapping"`
}

type EditService struct {
	Name         *string   `json:"name"`
	Description  *string   `json:"description"`
	ServiceType  *string   `json:"service_type"`
	Catalogue    *string   `json:"catalogue"`
	Logo         *string   `json:"logo"`
	Tags         *[]string `json:"tags"`
	Provider     *string   `json:"provider"`
	Model        *string   `json:"model"`
	ApprovalType *string   `json:"approval_type"`
	State        *string   `json:"state"`
	ModelMapping string    `json:"model_mapping"`
}

type CreateApp struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type UpdateApp struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
}

type EditMemberRole struct {
	Roles []string `json:"roles"`
}

type Users struct {
	Users []string `json:"users" aocheck:"user"`
}

type EditProjectMember struct {
	Roles []string `json:"roles" aocheck:"role"`
}

type SaveServiceDoc struct {
	Doc string `json:"doc"`
}
