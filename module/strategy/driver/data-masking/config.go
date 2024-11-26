package data_masking

type Config struct {
	Rules []*Rule `json:"rules"`
}

type Rule struct {
	Match *BasicItem `json:"match"`
	Mask  *Mask      `json:"mask"`
}

type BasicItem struct {
	Type  string `json:"type"`
	Value string `json:"value"`
}

type Mask struct {
	Type    string     `json:"type"`
	Begin   int        `json:"begin"`
	Length  int        `json:"length"`
	Replace *BasicItem `json:"replace"`
}
