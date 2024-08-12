package admin

type Node struct {
	Id     string   `json:"id,omitempty" yaml:"id"`
	Name   string   `json:"name,omitempty" yaml:"name"`
	Peer   []string `json:"peer,omitempty" yaml:"peer"`
	Admin  []string `json:"admin,omitempty" yaml:"admin"`
	Server []string `json:"server,omitempty" yaml:"server"`
	Leader bool     `json:"leader,omitempty" yaml:"leader"`
}
type Info struct {
	Cluster string  `yaml:"cluster" json:"cluster,omitempty"`
	Nodes   []*Node `yaml:"nodes" json:"nodes,omitempty"`
}
type Version struct {
}
