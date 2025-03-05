package ai_balance_dto

const (
	ModelTypeOnline = "online"
	ModelTypeLocal  = "local"

	StateNormal   = "normal"
	StateAbnormal = "abnormal"
)

type ModelType string

func (m ModelType) String() string {
	return string(m)
}

func (m ModelType) Int() int {
	switch m {
	case ModelTypeOnline:
		return 0
	case ModelTypeLocal:
		return 1
	default:
		return -1
	}
}

func ModelTypeFromInt(i int) ModelType {
	switch i {
	case 0:
		return ModelTypeOnline
	case 1:
		return ModelTypeLocal
	default:
		return "unknown"
	}
}

type ModelState string

func (m ModelState) String() string {
	return string(m)
}

func (m ModelState) Int() int {
	switch m {
	case StateNormal:
		return 1
	case StateAbnormal:
		return 0
	default:
		return -1
	}
}

func ModelStateFromInt(i int) ModelState {
	switch i {
	case 1:
		return StateNormal
	case 0:
		return StateAbnormal
	default:
		return "unknown"
	}
}

type Item struct {
	Id       string     `json:"id"`
	Priority int        `json:"priority"`
	Provider *BasicItem `json:"provider"`
	Model    *BasicItem `json:"model"`
	Type     ModelType  `json:"type"`
	State    ModelState `json:"state"`
	APICount int64      `json:"api_count"`
	KeyCount int64      `json:"key_count"`
}

type BasicItem struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}
