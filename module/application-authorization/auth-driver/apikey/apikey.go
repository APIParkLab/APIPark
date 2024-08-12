package apikey

import (
	"encoding/json"
	"fmt"
	
	auth_driver "github.com/APIParkLab/APIPark/module/application-authorization/auth-driver"
	
	"github.com/eolinker/go-common/utils"
	
	application_authorization_dto "github.com/APIParkLab/APIPark/module/application-authorization/dto"
)

const (
	driver = "apikey"
)

func init() {
	auth_driver.RegisterAuthFactory(driver, auth_driver.NewFactory[Config](driver))
}

var _ auth_driver.IAuthConfig = (*Config)(nil)

type Config struct {
	Apikey string            `json:"apikey"`
	Label  map[string]string `json:"label"`
}

func (a *Config) ID() string {
	return utils.Md5(a.Apikey)
}

func (a *Config) Valid() ([]byte, error) {
	if a.Apikey == "" {
		return nil, fmt.Errorf("apikey is empty")
	}
	return json.Marshal(a)
}

func (a *Config) Detail() []application_authorization_dto.DetailItem {
	return []application_authorization_dto.DetailItem{
		{
			Key:   "Apikey",
			Value: a.Apikey,
		},
	}
}
