package auth

func init() {
	b := NewBasic()
	Register(b.Name(), b)
}

func NewBasic() *Basic {
	return &Basic{}
}

type Basic struct {
}

func (b *Basic) Name() string {
	return "basic"
}

func (b *Basic) ToPattern(cfg map[string]interface{}) interface{} {
	result := make(map[string]interface{})
	result["username"] = cfg["user_name"]
	result["password"] = cfg["password"]
	return result
}

func (b *Basic) ToConfig(cfg map[string]interface{}) interface{} {
	return nil
}
