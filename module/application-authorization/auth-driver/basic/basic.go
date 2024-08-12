package basic

import (
	"encoding/json"
	"fmt"
	
	auth_driver "github.com/APIParkLab/APIPark/module/application-authorization/auth-driver"
	
	application_authorization_dto "github.com/APIParkLab/APIPark/module/application-authorization/dto"
)

var _ auth_driver.IAuthConfig = &Config{}

var (
	driver = "basic"
)

func init() {
	auth_driver.RegisterAuthFactory(driver, auth_driver.NewFactory[Config](driver))
}

type Config struct {
	UserName string            `json:"user_name"`
	Password string            `json:"password"`
	Label    map[string]string `json:"label"`
}

func (cfg *Config) ID() string {
	return cfg.UserName
}

func (cfg *Config) Valid() ([]byte, error) {
	if cfg.UserName == "" {
		return nil, fmt.Errorf("username is empty")
	}
	if cfg.Password == "" {
		return nil, fmt.Errorf("password is empty")
	}
	return json.Marshal(cfg)
}

func (cfg *Config) Detail() []application_authorization_dto.DetailItem {
	
	return []application_authorization_dto.DetailItem{
		{Key: "用户名", Value: cfg.UserName},
		{Key: "密码", Value: cfg.Password},
	}
}
