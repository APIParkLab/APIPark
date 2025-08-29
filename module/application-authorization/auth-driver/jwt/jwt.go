package jwt

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"

	auth_driver "github.com/APIParkLab/APIPark/module/application-authorization/auth-driver"

	"github.com/eolinker/go-common/utils"

	application_authorization_dto "github.com/APIParkLab/APIPark/module/application-authorization/dto"
)

const (
	driver = "jwt"
)

func init() {
	auth_driver.RegisterAuthFactory(driver, auth_driver.NewFactory[Config](driver))
}

type Config struct {
	Iss               string            `json:"iss"`
	Algorithm         string            `json:"algorithm"`
	Secret            string            `json:"secret"`
	PublicKey         string            `json:"publicKey"`
	User              string            `json:"user"`
	UserPath          string            `json:"userPath"`
	ClaimsToVerify    []string          `json:"claimsToVerify"`
	Label             map[string]string `json:"label"`
	SignatureIsBase64 bool              `json:"signatureIsBase64"`
}

func (cfg *Config) ID() string {
	builder := strings.Builder{}
	switch cfg.Algorithm {
	case "HS256", "HS384", "HS512":
		builder.WriteString(strings.TrimSpace(cfg.Iss))
		builder.WriteString(strings.TrimSpace(cfg.Secret))
		builder.WriteString(strings.TrimSpace(cfg.Algorithm))
		builder.WriteString(strconv.FormatBool(cfg.SignatureIsBase64))
		builder.WriteString(strings.TrimSpace(cfg.UserPath))
		for _, claim := range cfg.ClaimsToVerify {
			builder.WriteString(strings.TrimSpace(claim))
		}

	case "RS256", "RS384", "RS512", "ES256", "ES384", "ES512":
		builder.WriteString(strings.TrimSpace(cfg.Iss))
		builder.WriteString(strings.TrimSpace(cfg.PublicKey))
		builder.WriteString(strings.TrimSpace(cfg.Algorithm))
		builder.WriteString(strings.TrimSpace(cfg.UserPath))
		for _, claim := range cfg.ClaimsToVerify {
			builder.WriteString(strings.TrimSpace(claim))
		}
	default:
		return ""
	}
	return utils.Md5(builder.String())
}

func (cfg *Config) Valid() ([]byte, error) {
	if cfg.Iss == "" {
		return nil, errors.New("iss is null")
	}
	if cfg.Algorithm == "" {
		return nil, errors.New("algorithm is null")
	}
	algorithm := strings.ToUpper(cfg.Algorithm)
	switch algorithm {
	case "HS256", "HS384", "HS512":
		if cfg.Secret == "" {
			return nil, errors.New("secret is null")
		}
	case "RS256", "RS384", "RS512", "ES256", "ES384", "ES512":
		if cfg.PublicKey == "" {
			return nil, errors.New("public_key is null")
		}
	default:
		return nil, fmt.Errorf("unsupport algorithm")
	}

	//校验 校验字段
	for _, claim := range cfg.ClaimsToVerify {
		switch claim {
		case "exp", "nbf":
		default:
			return nil, fmt.Errorf("claim key %s is illegal. ", claim)
		}
	}
	return json.Marshal(cfg)
}

func (cfg *Config) Detail() []application_authorization_dto.DetailItem {

	items := []application_authorization_dto.DetailItem{
		{Key: "Iss", Value: cfg.Iss},
		{Key: "签名算法", Value: cfg.Algorithm},
		{Key: "用户名", Value: cfg.User},
		{Key: "用户名JsonPath", Value: cfg.UserPath},
		{Key: "校验字段", Value: strings.Join(cfg.ClaimsToVerify, ",")},
	}

	switch cfg.Algorithm {
	case "HS256", "HS384", "HS512":
		items = append(items, application_authorization_dto.DetailItem{Key: "Secret", Value: cfg.Secret})
		base64 := "false"
		if cfg.SignatureIsBase64 {
			base64 = "true"
		}
		items = append(items, application_authorization_dto.DetailItem{Key: "SignatureIsBase64", Value: base64})
	default:
		items = append(items, application_authorization_dto.DetailItem{Key: "RSA公钥", Value: cfg.PublicKey})
	}

	return items
}
