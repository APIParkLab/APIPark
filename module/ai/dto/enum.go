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
		return 1
	case ProviderDisabled:
		return 0
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
		return ProviderDisabled
	case 1:
		return ProviderEnabled
	default:
		return ProviderEnabled
	}
}
