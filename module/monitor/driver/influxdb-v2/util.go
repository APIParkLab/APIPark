package influxdb_v2

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/APIParkLab/APIPark/service/monitor"
)

const (
	oneHour = 3600
	oneDay  = 24 * oneHour
	tenDay  = 10 * oneDay
	oneYear = 365 * oneDay

	bucketMinuteRetention = (7 - 1) * oneDay
	bucketHourRetention   = (90 - 1) * oneDay
	bucketDayRetention    = (5*365 - 1) * oneDay

	bucketMinute = "apinto/minute"
	bucketHour   = "apinto/hour"
	bucketDay    = "apinto/day"
	bucketWeek   = "apinto/week"

	timeZone = "Asia/Shanghai"
)

// formatStartTimeHour 将time格式化为小时整
func formatStartTimeHour(t time.Time, location *time.Location) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), t.Hour(), 0, 0, 0, location)
}

// formatStartTimeDay 将time格式化为天整
func formatStartTimeDay(t time.Time, location *time.Location) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, location)
}

// formatStartTimeDay 将startTime向前移到周一，因为week桶里的time是每个周一才有数据
func formatStartTimeToMonday(t time.Time, location *time.Location) time.Time {
	var dayDiff int
	switch t.Weekday() {
	case time.Monday:
		dayDiff = 0
	case time.Tuesday:
		dayDiff = -1
	case time.Wednesday:
		dayDiff = -2
	case time.Thursday:
		dayDiff = -3
	case time.Friday:
		dayDiff = -4
	case time.Saturday:
		dayDiff = -5
	case time.Sunday:
		dayDiff = -6
	}

	return time.Date(t.Year(), t.Month(), t.Day()+dayDiff, 0, 0, 0, 0, location)
}

// FormatFloat64 float64保留places位小数
func FormatFloat64(f float64, places int) float64 {
	formatStr := "%." + strconv.Itoa(places) + "f"
	f64, _ := strconv.ParseFloat(fmt.Sprintf(formatStr, f), 64)
	return f64
}

func formatFilter(wheres []monitor.MonWhereItem) string {
	filter := ``
	if len(wheres) > 0 {
		filters := make([]string, 0, len(wheres))
		for _, where := range wheres {
			if len(where.Values) > 0 {
				wl := make([]string, 0, len(where.Values))
				for _, v := range where.Values {
					wl = append(wl, fmt.Sprintf(fmt.Sprintf(`r["%s"] == "%s"`, where.Key, v)))
				}
				filters = append(filters, fmt.Sprint("(", strings.Join(wl, " or "), ")"))
			}
		}
		filter = fmt.Sprint(`|> filter(fn:(r)=>`, strings.Join(filters, " and "), ")")
	}
	return filter
}

// getTimeIntervalAndBucket 根据start和end来获取窗口时间间隔，窗口偏移量offset，以及使用的bucket, 查询的startTime也会格式化
func getTimeIntervalAndBucket(startTime, endTime time.Time) (time.Time, string, string, string) {
	//根据start距离现在的时长算出可使用的最小桶
	minimumBucket := ""
	startToNow := time.Now().Unix() - startTime.Unix()
	if startToNow <= bucketMinuteRetention {
		minimumBucket = bucketMinute
	} else if startToNow <= bucketHourRetention {
		minimumBucket = bucketHour
	} else if startToNow <= bucketDayRetention {
		minimumBucket = bucketDay
	} else {
		minimumBucket = bucketWeek
	}

	//结合可使用的最小桶，根据end-start时间间隔来得出合适的桶和趋势图时间间隔
	diff := endTime.Unix() - startTime.Unix()
	location, _ := time.LoadLocation(timeZone)
	if diff <= oneHour {

		switch minimumBucket {
		case bucketMinute:
			return startTime, "1m", "", bucketMinute
		case bucketHour:
			//start变成小时整
			newStart := formatStartTimeHour(startTime, location)
			return newStart, "1h", "", bucketHour
		case bucketDay:
			//start 变成一天整
			newStart := formatStartTimeDay(startTime, location)
			return newStart, "1d", "", bucketDay
		case bucketWeek:
			//将startTime往前顺延到周一
			newStart := formatStartTimeToMonday(startTime, location)
			return newStart, "1w", "-4d", bucketWeek
		}

	} else if diff <= oneDay {

		switch minimumBucket {
		case bucketMinute:
			offset := ""
			offsetTime := startTime.Minute() % 5
			if offsetTime != 0 {
				offset = fmt.Sprintf("%dm", offsetTime)
			}
			return startTime, "5m", offset, bucketMinute

		case bucketHour:
			newStart := formatStartTimeHour(startTime, location)
			return newStart, "1h", "", bucketHour
		case bucketDay:
			newStart := formatStartTimeDay(startTime, location)
			return newStart, "1d", "", bucketDay
		case bucketWeek:
			//将startTime往前顺延到周一
			newStart := formatStartTimeToMonday(startTime, location)
			return newStart, "1w", "-4d", bucketWeek
		}

	} else if diff <= tenDay {

		switch minimumBucket {
		case bucketMinute, bucketHour:
			newStart := formatStartTimeHour(startTime, location)
			return newStart, "1h", "", bucketHour
		case bucketDay:
			newStart := formatStartTimeDay(startTime, location)
			return newStart, "1d", "", bucketDay
		case bucketWeek:
			//将startTime往前顺延到周一
			newStart := formatStartTimeToMonday(startTime, location)
			return newStart, "1w", "-4d", bucketWeek
		}

	} else if diff < oneYear {

		switch minimumBucket {
		case bucketMinute, bucketHour, bucketDay:
			newStart := formatStartTimeDay(startTime, location)
			return newStart, "1d", "", bucketDay
		case bucketWeek:
			//将startTime往前顺延到周一
			newStart := formatStartTimeToMonday(startTime, location)
			return newStart, "1w", "-4d", bucketWeek
		}

	}

	//end-start大于1年 时间间隔为1周
	//将startTime往前顺延到周一
	newStart := formatStartTimeToMonday(startTime, location)
	return newStart, "1w", "-4d", bucketWeek
}

func formatMessageTrendData(data []int64) []float64 {
	floatData := make([]float64, 0, len(data))
	for _, d := range data {
		floatData = append(floatData, FormatFloat64(float64(d)/1024, 2))
	}
	return floatData
}
