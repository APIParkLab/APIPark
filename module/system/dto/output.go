package system_dto

import (
	"reflect"
	"strconv"
)

type Setting struct {
	InvokeAddress string `json:"invoke_address" key:"system.node.invoke_address"`
	SitePrefix    string `json:"site_prefix" key:"system.setting.site_prefix"`
}

func MapStringToStruct[T any](m map[string]string) *T {
	var result T
	val := reflect.ValueOf(&result).Elem()

	// 获取结构体的类型
	t := val.Type()

	// 查找结构体中与键名匹配的字段
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		key := field.Tag.Get("key")
		if key == "" {
			continue
		}
		v, ok := m[key]
		if !ok {
			continue
		}
		// 获取字段的值
		fieldVal := val.Field(i)
		if !fieldVal.CanSet() {
			continue
		}
		fieldVal.SetString(v)

		// 如果字段不可设置，跳过
		if !fieldVal.CanSet() {
			continue
		}

		// 根据字段的类型，进行类型转换
		switch fieldVal.Kind() {
		case reflect.Float64:
			// 如果是 string 类型且非空，转换为 float64
			if floatVal, err := strconv.ParseFloat(v, 64); err == nil {
				fieldVal.SetFloat(floatVal)
			}

		case reflect.Int:

			if intVal, err := strconv.Atoi(v); err == nil {
				fieldVal.SetInt(int64(intVal))
			}
		case reflect.String:
			fieldVal.SetString(v)
		default:
			// 其他类型不进行转换
		}
	}

	return &result
}
