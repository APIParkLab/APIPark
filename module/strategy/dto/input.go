package strategy_dto

type Create struct {
	Scope    Scope       `json:"-"`
	Target   string      `json:"-"`
	Driver   string      `json:"-"`
	ID       string      `json:"id"`
	Name     string      `json:"name"`
	Priority int         `json:"priority"`
	Desc     string      `json:"desc"`
	Filters  []*Filter   `json:"filters"`
	Config   interface{} `json:"config"`
}

type Edit struct {
	Name     *string      `json:"name"`
	Priority *int         `json:"priority"`
	Desc     *string      `json:"desc"`
	Filters  *[]*Filter   `json:"filters"`
	Config   *interface{} `json:"config"`
}

type Filter struct {
	Name   string   `json:"name"`
	Values []string `json:"values"`
	Type   string   `json:"type"`
	Label  string   `json:"label"`
	Title  string   `json:"title"`
}
