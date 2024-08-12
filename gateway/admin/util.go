package admin

import "strings"

func formatAddr(address []string) []string {
	ra := make([]string, 0, len(address))
	for _, a := range address {
		if a != "" {
			if !strings.HasPrefix(a, "http://") && !strings.HasPrefix(a, "https://") {
				a = "http://" + a
			}

			ra = append(ra, strings.TrimSuffix(a, "/")+"/")
		}
	}
	return ra
}
