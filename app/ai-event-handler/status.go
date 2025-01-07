package main

import ai_key_dto "github.com/APIParkLab/APIPark/module/ai-key/dto"

var (
	StatusNormal         = "normal"
	StatusInvalidRequest = "invalid request"
	StatusQuotaExhausted = "quota exhausted"
	StatusExpired        = "expired"
	StatusExceeded       = "exceeded"
	StatusInvalid        = "invalid"
	StatusTimeout        = "timeout"
)

func ToKeyStatus(status string) ai_key_dto.KeyStatus {
	switch status {
	case StatusNormal:
		return ai_key_dto.KeyNormal
	case StatusInvalidRequest:
		return ai_key_dto.KeyNormal
	case StatusQuotaExhausted:
		return ai_key_dto.KeyExceed
	case StatusExpired:
		return ai_key_dto.KeyExpired
	case StatusExceeded:
		return ai_key_dto.KeyNormal
	case StatusInvalid:
		return ai_key_dto.KeyError
	case StatusTimeout:
		return ai_key_dto.KeyError
	default:
		return ai_key_dto.KeyNormal
	}
}
