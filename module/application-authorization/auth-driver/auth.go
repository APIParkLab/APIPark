package auth_driver

import (
	"encoding/json"
	"fmt"
	
	application_authorization_dto "github.com/APIParkLab/APIPark/module/application-authorization/dto"
)

type IAuth interface {
	GenerateID(position string, tokenName string) string
	Type() string
	AuthConfig() IAuthConfig
}

type IAuthConfig interface {
	ID() string
	Valid() ([]byte, error)
	Detail() []application_authorization_dto.DetailItem
}

type Auth struct {
	driver     string
	authConfig IAuthConfig
}

func (a *Auth) GenerateID(position string, tokenName string) string {
	return fmt.Sprintf("%s-%s-%s-%s", position, tokenName, a.driver, a.authConfig.ID())
}

func (a *Auth) Type() string {
	return a.driver
}

func (a *Auth) AuthConfig() IAuthConfig {
	return a.authConfig
}

type IFactory interface {
	Create(config interface{}) (IAuth, error)
}

type Factory[T any] struct {
	driver string
}

func NewFactory[T any](driver string) *Factory[T] {
	return &Factory[T]{driver: driver}
}

func (f *Factory[T]) Create(config interface{}) (IAuth, error) {
	cfg, err := generateStruct[T](config)
	if err != nil {
		return nil, err
	}
	authConfig, ok := interface{}(cfg).(IAuthConfig)
	if !ok {
		return nil, fmt.Errorf("no implement IAuthConfig")
	}
	return &Auth{driver: f.driver, authConfig: authConfig}, nil
}

func generateStruct[T any](cfg interface{}) (*T, error) {
	result := new(T)
	switch c := cfg.(type) {
	case string:
		err := json.Unmarshal([]byte(c), result)
		if err != nil {
			return nil, err
		}
	case []byte:
		err := json.Unmarshal(c, result)
		if err != nil {
			return nil, err
		}
	case *map[string]interface{}, map[string]interface{}:
		data, err := json.Marshal(c)
		if err != nil {
			return nil, err
		}
		err = json.Unmarshal(data, result)
		if err != nil {
			return nil, err
		}
	}
	
	return result, nil
}
