package ai_dto

var (
	ProviderEnabled  ProviderStatus = "enabled"
	ProviderDisabled ProviderStatus = "disabled"
	ProviderAbnormal ProviderStatus = "abnormal"
)

type ProviderStatus string

func (p ProviderStatus) Int() int {
	switch p {
	case ProviderAbnormal:
		return 2
	case ProviderEnabled:
		return 0
	case ProviderDisabled:
		return 1
	default:
		return 1
	}
}

func (p ProviderStatus) String() string {
	return string(p)
}

func ToProviderStatus(status int) ProviderStatus {
	switch status {
	case 2:
		return ProviderAbnormal
	case 0:
		return ProviderEnabled
	case 1:
		return ProviderDisabled
	default:
		return ProviderDisabled
	}
}
