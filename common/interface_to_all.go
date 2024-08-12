package common

import (
	"fmt"
	"strconv"
)

func FmtIntFromInterface(val interface{}) int64 {
	if val == nil {
		return 0
	}

	switch ret := val.(type) {
	case int8:
		return int64(ret)
	case int16:
		return int64(ret)
	case int32:
		return int64(ret)
	case int64:
		return ret
	case uint8:
		return int64(ret)
	case uint16:
		return int64(ret)
	case uint32:
		return int64(ret)
	case uint64:
		return int64(ret)
	case int:
		return int64(ret)
	default:
		return 0
	}
}

func FmtStringFromInterface(val interface{}) string {
	if val == nil {
		return ""
	}
	switch ret := val.(type) {
	case string:
		return ret
	case int8, uint8, int16, uint16, int, uint, int64, uint64, float32, float64:
		return fmt.Sprintf("%v", ret)
	}
	return ""
}

func FmtFloatFromInterface(val interface{}) float64 {
	if val == nil {
		return 0
	}

	switch ret := val.(type) {
	case float64:
		return ret
	case float32:
		return float64(ret)
	default:
		return 0
	}
}

func FloatToString(val float64) string {
	float, _ := strconv.ParseFloat(fmt.Sprintf("%.2f", val), 64)
	return strconv.FormatFloat(float, 'g', -1, 64)
}
