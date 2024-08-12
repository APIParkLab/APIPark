package driver

import (
	"gopkg.in/yaml.v3"
)

func Read(input []byte) (*PluginCfg, error) {

	p := new(PluginCfg)

	err := yaml.Unmarshal(input, &p)
	if err != nil {
		return nil, err
	}
	err = yaml.Unmarshal(input, p)
	if err != nil {
		return nil, err
	}
	if p.Version == "" {
		p.Version = "v0.0.0"
	}

	return p, nil
}
