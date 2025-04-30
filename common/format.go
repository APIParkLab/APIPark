package common

import (
	"fmt"
	"strconv"
)

func FormatCountInt64(count int64) string {
	switch {
	case count < 1000:
		return strconv.FormatInt(count, 10)
	case count < 1000000:
		return fmt.Sprintf("%.1fK", float64(count)/1000)
	case count < 1000000000:
		return fmt.Sprintf("%.1fM", float64(count)/1000000)
	case count < 1000000000000:
		return fmt.Sprintf("%.1fB", float64(count)/1000000000)
	default:
		return fmt.Sprintf("%.1fT", float64(count)/1000000000000)
	}
}

func FormatCountFloat64(count float64) string {
	switch {
	case count < 1000:
		return strconv.FormatFloat(count, 'f', -1, 64)
	case count < 1000000:
		return fmt.Sprintf("%.1fK", count/1000)
	case count < 1000000000:
		return fmt.Sprintf("%.1fM", count/1000000)
	case count < 1000000000000:
		return fmt.Sprintf("%.1fB", count/1000000000)
	default:
		return fmt.Sprintf("%.1fT", count/1000000000000)
	}
}

func FormatTime(t int64) string {
	if t < 1000 {
		return strconv.FormatInt(t, 10) + "ms"
	}
	if t < 1000000 {
		return fmt.Sprintf("%.1fs", float64(t)/1000)
	}
	if t < 1000000000 {
		return fmt.Sprintf("%.1fmin", float64(t)/1000000)
	}
	if t < 1000000000000 {
		return fmt.Sprintf("%.1fhour", float64(t)/1000000000)
	}
	return fmt.Sprintf("%.1D", float64(t)/1000000000000)
}

func FormatByte(b int64) string {
	const (
		KB = 1000
		MB = KB * 1000
		GB = MB * 1000
		TB = GB * 1000
		PB = TB * 1000
	)

	switch {
	case b < KB:
		return fmt.Sprintf("%dB", b)
	case b < MB:
		return fmt.Sprintf("%.1fKB", float64(b)/KB)
	case b < GB:
		return fmt.Sprintf("%.1fMB", float64(b)/MB)
	case b < TB:
		return fmt.Sprintf("%.1fGB", float64(b)/GB)
	case b < PB:
		return fmt.Sprintf("%.1fTB", float64(b)/TB)
	default:
		return fmt.Sprintf("%.1fPB", float64(b)/PB)
	}
}
