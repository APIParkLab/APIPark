package access

import (
	"fmt"
	"os"
	"sort"
	"strings"
	"testing"

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
