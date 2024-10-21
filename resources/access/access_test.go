package access

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
	"testing"

	yaml "gopkg.in/yaml.v3"

	"github.com/eolinker/go-common/access"
)

func TestPrintlnRoleAccess(t *testing.T) {
	system, has := access.GetPermit("system")
	if has {
		keys := system.AccessKeys()
		sort.Strings(keys)
		for _, k := range keys {
			fmt.Printf("- %s\n", k)
		}
	}
	team, has := access.GetPermit("team")
	if has {
		keys := team.AccessKeys()
		sort.Strings(keys)
		for _, k := range keys {
			fmt.Printf("- %s\n", k)
		}
	}
}

func TestPrintlnAccessAPIs(t *testing.T) {
	builder := &strings.Builder{}
	printAccesses("system", builder)
	printAccesses("team", builder)
	os.WriteFile("permit.yaml", []byte(builder.String()), 0644)
}

func printAccesses(group string, builder *strings.Builder) {
	handler, has := access.GetPermit(group)
	if has {
		keys := handler.AccessKeys()
		sort.Strings(keys)
		builder.WriteString(fmt.Sprintf("%s:\n", group))
		for _, key := range keys {
			apis, err := handler.GetPermits(key)
			if err != nil {
				continue
			}
			builder.WriteString(fmt.Sprintf("  %s:\n", key))
			for _, api := range apis {
				builder.WriteString(fmt.Sprintf("    - %s\n", api))
			}
		}
	}
	return
}

func TestPrintName(t *testing.T) {
	result := make(map[string]string)
	data, err := os.ReadFile("access.yaml")
	if err != nil {
		t.Fatal(err)
	}
	tmp := make(map[string]interface{})
	err = yaml.Unmarshal(data, &tmp)
	if err != nil {
		t.Fatal(err)
	}
	recursionReadKey("name", tmp, result)
	data, err = os.ReadFile("role.yaml")
	if err != nil {
		t.Fatal(err)
	}
	tmp = make(map[string]interface{})
	err = yaml.Unmarshal(data, &tmp)
	if err != nil {
		t.Fatal(err)
	}
	recursionReadKey("name", tmp, result)
	r, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		t.Fatal(err)
	}

	fmt.Println(string(r))

}

// 递归读取文件中name字段
func recursionReadKey(key string, data map[string]interface{}, result map[string]string) {
	for k, v := range data {
		switch t := v.(type) {
		case string:
			if k == key {
				result[strings.ToLower(t)] = ""
			}
		case map[string]interface{}:
			recursionReadKey(key, t, result)
		case []interface{}:
			for _, n := range t {
				switch tt := n.(type) {
				case map[string]interface{}:
					recursionReadKey(key, tt, result)
				}
			}
		}
	}
}
