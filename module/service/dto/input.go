package service_dto

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
	Provider     *string  `json:"provider" aocheck:"ai_provider"`
	AsApp        *bool    `json:"as_app"`
	AsServer     *bool    `json:"as_server"`
}

type EditService struct {
	Name         *string   `json:"name"`
	Description  *string   `json:"description"`
	ServiceType  *string   `json:"service_type"`
	Catalogue    *string   `json:"catalogue"`
	Logo         *string   `json:"logo"`
	Tags         *[]string `json:"tags"`
	Provider     *string   `json:"provider" aocheck:"ai_provider"`
	ApprovalType *string   `json:"approval_type"`
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
