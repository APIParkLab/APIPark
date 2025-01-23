package ai_key_dto

var (
	KeyNormal  KeyStatus = "normal"
	KeyExceed  KeyStatus = "exceeded"
	KeyExpired KeyStatus = "expired"
	KeyDisable KeyStatus = "disabled"
	KeyError   KeyStatus = "error"
)

type KeyStatus string

func (s KeyStatus) String() string {
	return string(s)
}

func (s KeyStatus) Int() int {
	switch s {
	case KeyDisable:
		return 0
	case KeyNormal:
		return 1
	case KeyError:
		return 2
	case KeyExceed:
		return 3
	case KeyExpired:
		return 4
	default:
		return 0
	}
}

func ToKeyStatus(status int) KeyStatus {
	switch status {
	case 0:
		return KeyDisable
	case 1:
		return KeyNormal
	case 2:
		return KeyError
	case 3:
		return KeyExceed
	case 4:
		return KeyExpired
	default:
		return KeyDisable
	}
}
