package system_dto

import (
	"net/url"
	"reflect"
)

type InputSetting struct {
	InvokeAddress string `json:"invoke_address" key:"system.node.invoke_address"`
	SitePrefix    string `json:"site_prefix" key:"system.setting.site_prefix"`
}

func (i *InputSetting) Validate() error {
	_, err := url.Parse(i.InvokeAddress)
	if err != nil {
		return err
	}
	return nil
}

func ToKeyMap(i interface{}) map[string]string {
	result := make(map[string]string)
	val := reflect.ValueOf(i)
	typ := reflect.TypeOf(i)
	if typ.Kind() == reflect.Ptr {
		val = val.Elem()
		typ = typ.Elem()
	}
	switch typ.Kind() {
	case reflect.Struct:
		{
			for i := 0; i < typ.NumField(); i++ {
				f := typ.Field(i)
				if f.Tag.Get("key") != "" {
					result[f.Tag.Get("key")] = val.Field(i).String()
				}
			}
		}
	}
	return result
}
