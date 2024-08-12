package catalogue

import (
	"sort"
	
	"github.com/APIParkLab/APIPark/service/catalogue"
)

type Group struct {
	Uuid     string
	Name     string
	Parent   string
	Depth    int
	sort     int
	children []*Group
	parents  []string
}
type Root struct {
	nodes map[string]*Group
	list  []*Group
}

func (r *Root) GetParents(uuid string) []string {
	if uuid == "" {
		return nil
	}
	n, has := r.nodes[uuid]
	if has {
		return n.parents
	}
	return nil
}

func (r *Root) GetSub(uuid string) []string {
	if uuid == "" {
		uuids := make([]string, 0, len(r.list))
		for _, g := range r.list {
			uuids = append(uuids, g.Uuid)
		}
		return uuids
	}
	n, has := r.nodes[uuid]
	if has {
		return n.SubId()
	}
	return nil
}
func NewRoot(list []*catalogue.Catalogue) *Root {
	m := make(map[string]*Group)
	l := make([]*Group, 0, len(list))
	for _, i := range list {
		g := &Group{
			Uuid:     i.Id,
			Parent:   i.Parent,
			Name:     i.Name,
			Depth:    0,
			children: nil,
		}
		l = append(l, g)
		m[g.Uuid] = g
	}
	parentMap := make(map[string][]string)
	root := new(Group)
	for _, i := range l {
		if i.Parent != "" {
			p, has := m[i.Parent]
			if !has {
				i.Parent = ""
				root.children = append(root.children, i)
			} else {
				p.children = append(p.children, i)
				p.parents = getParents(i.Parent, m, parentMap)
			}
			
		} else {
			root.children = append(root.children, i)
		}
	}
	root.ResetDepth(-1)
	sort.Sort(Groups(l))
	return &Root{nodes: m, list: l}
}

func getParents(parentID string, nodeMap map[string]*Group, parentMap map[string][]string) []string {
	if parentID == "" {
		return nil
	}
	if parents, has := parentMap[parentID]; has {
		return parents
	}
	parents := make([]string, 0)
	node, has := nodeMap[parentID]
	if !has {
		return nil
	}
	parents = append(parents, parentID)
	tmp := getParents(node.Parent, nodeMap, parentMap)
	if tmp != nil {
		parents = append(parents, tmp...)
	}
	return parents
}

func (g *Group) ResetDepth(d int) {
	g.Depth = d
	next := d + 1
	for _, c := range g.children {
		c.ResetDepth(next)
	}
}
func (g *Group) SubId() []string {
	if len(g.children) > 0 {
		subs := make([]string, 0, len(g.children))
		for _, c := range g.children {
			subs = append(subs, c.Uuid)
			sc := c.SubId()
			if len(sc) > 0 {
				subs = append(subs, sc...)
			}
		}
		return subs
	}
	return nil
}

type Groups []*Group

func (g Groups) Len() int {
	return len(g)
}

func (g Groups) Less(i, j int) bool {
	if g[i].Depth == g[j].Depth {
		if g[i].Parent == g[i].Parent {
			if g[i].sort == g[j].sort {
				return g[i].Uuid < g[j].Uuid
			}
			return g[i].sort < g[j].sort
		}
		return g[i].Parent < g[i].Parent
	}
	return g[i].Depth < g[j].Depth
}

func (g Groups) Swap(i, j int) {
	g[i], g[j] = g[j], g[i]
}
