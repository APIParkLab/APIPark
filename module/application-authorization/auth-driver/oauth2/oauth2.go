package oauth2

import (
	"encoding/json"
	"strconv"

	auth_driver "github.com/APIParkLab/APIPark/module/application-authorization/auth-driver"

	application_authorization_dto "github.com/APIParkLab/APIPark/module/application-authorization/dto"
)

const (
	driver = "oauth2"
)

var _ auth_driver.IAuthConfig = (*Config)(nil)

func init() {
	auth_driver.RegisterAuthFactory(driver, auth_driver.NewFactory[Config](driver))
}

type Config struct {
	ClientId     string   `json:"client_id" label:"客户端ID"`
	ClientSecret string   `json:"client_secret" label:"客户端密钥"`
	ClientType   string   `json:"client_type" label:"客户端类型" enum:"public,confidential"`
	HashSecret   bool     `json:"hash_secret" label:"是否Hash加密"`
	RedirectUrls []string `json:"redirect_urls" label:"重定向URL列表"`
	Hashed       bool     `json:"hashed"`
}

func (cfg *Config) ID() string {
	return cfg.ClientId
}

func (cfg *Config) Valid() ([]byte, error) {

	if cfg.HashSecret && !cfg.Hashed {
		// 未加密
		secret, err := hashSecret([]byte(cfg.ClientSecret), 0, 0, 0)
		if err != nil {
			return nil, err
		} else {
			cfg.ClientSecret = secret
			cfg.Hashed = true
		}
	}
	return json.Marshal(cfg)
}

func (cfg *Config) Detail() []application_authorization_dto.DetailItem {

	redirectURLs, _ := json.Marshal(cfg.RedirectUrls)

	return []application_authorization_dto.DetailItem{
		{Key: "客户端ID", Value: cfg.ClientId},
		{Key: "客户端密钥", Value: cfg.ClientSecret},
		{Key: "客户端类型", Value: cfg.ClientType},
		{Key: "对密钥进行Hash", Value: strconv.FormatBool(cfg.HashSecret)},
		{Key: "重定向URL列表", Value: string(redirectURLs)},
	}
}
