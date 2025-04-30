package monitor

import (
	"time"
)

const (
	oneMinute             = 60
	oneHour               = 3600
	oneDay                = 24 * oneHour
	tenDay                = 10 * oneDay
	oneYear               = 365 * oneDay
	bucketMinuteRetention = (7) * oneDay
	bucketHourRetention   = (90) * oneDay
	bucketDayRetention    = (5 * 365) * oneDay
)

// getTimeIntervalAndBucket 根据start和end来获取窗口时间间隔，窗口偏移量offset，以及使用的bucket, 查询的startTime也会格式化
func getTimeInterval(startTime, endTime time.Time) int64 {
	startToNow := time.Now().Unix() - startTime.Unix()

	//结合可使用的最小桶，根据end-start时间间隔来得出合适的桶和趋势图时间间隔
	diff := endTime.Unix() - startTime.Unix()
	if diff <= oneHour {
		return 5 * oneMinute
	} else if diff <= oneDay {

		switch {
		case startToNow <= bucketHourRetention:
			return oneHour
		case startToNow <= bucketDayRetention:
			return oneDay
		default:
			return 7 * oneDay
		}

	} else if diff <= tenDay {

		switch {
		case startToNow <= bucketHourRetention:
			return oneHour
		case startToNow <= bucketDayRetention:
			return oneDay
		default:
			return 7 * oneDay
		}

	} else {
		return 7 * oneDay
	}

}
