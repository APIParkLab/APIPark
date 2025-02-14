package ai_local_dto

import "github.com/eolinker/go-common/auto"

type LocalModelState string

const (
	LocalModelStateNormal         LocalModelState = "normal"
	LocalModelStateDisable        LocalModelState = "disabled"
	LocalModelStateDeployingError LocalModelState = "deploying_error"
	LocalModelStateError          LocalModelState = "error"
	LocalModelStateDeploying      LocalModelState = "deploying"

	DeployStateDownload          DeployState = "download"
	DeployStateDeploy            DeployState = "deploy"
	DeployStateInitializing      DeployState = "initializing"
	DeployStateFinish            DeployState = "finish"
	DeployStateDownloadError     DeployState = "download error"
	DeployStateDeployError       DeployState = "deploy error"
	DeployStateInitializingError DeployState = "initializing error"
)

func (l LocalModelState) String() string {
	return string(l)
}

func (l LocalModelState) Int() int {
	switch l {
	case LocalModelStateDisable:
		return 0
	case LocalModelStateNormal:
		return 1
	case LocalModelStateError:
		return 2
	case LocalModelStateDeploying:
		return 3
	case LocalModelStateDeployingError:
		return 4
	default:
		return 0
	}
}

func FromLocalModelState(state int) LocalModelState {
	switch state {
	case 0:
		return LocalModelStateDisable
	case 1:
		return LocalModelStateNormal
	case 2:
		return LocalModelStateError
	case 3:
		return LocalModelStateDeploying
	case 4:
		return LocalModelStateDeployingError
	default:
		return LocalModelStateDisable
	}
}

type SimpleItem struct {
	Id            string `json:"id"`
	Name          string `json:"name"`
	DefaultConfig string `json:"default_config"`
}

type LocalModelItem struct {
	Id       string          `json:"id"`
	Name     string          `json:"name"`
	State    LocalModelState `json:"state"`
	APICount int64           `json:"api_count"`

	UpdateTime auto.TimeLabel `json:"update_time"`
	CanDelete  bool           `json:"can_delete"`
}

type LocalModelPackageItem struct {
	Id        string `json:"id"`
	Name      string `json:"name"`
	Size      string `json:"size"`
	IsPopular bool   `json:"is_popular"`
}

type DeployState string

func (d DeployState) String() string {
	return string(d)
}

func (d DeployState) Int() int {
	switch d {
	case DeployStateDownload:
		return 1
	case DeployStateDeploy:
		return 2
	case DeployStateInitializing:
		return 3
	case DeployStateFinish:
		return 4
	case DeployStateDownloadError:
		return 5
	case DeployStateDeployError:
		return 6
	case DeployStateInitializingError:
		return 7
	default:
		return 1
	}
}

func FromDeployState(state int) DeployState {
	switch state {
	case 1:
		return DeployStateDownload
	case 2:
		return DeployStateDeploy
	case 3:
		return DeployStateInitializing
	case 4:
		return DeployStateFinish
	case 5:
		return DeployStateDownloadError
	case 6:
		return DeployStateDeployError
	case 7:
		return DeployStateInitializingError
	default:
		return DeployStateDownload
	}
}

type ModelInfo struct {
	Current     int64  `json:"current"`
	Total       int64  `json:"total"`
	LastMessage string `json:"last_message"`
}
