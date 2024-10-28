//go:build !init

package main

import (
	_ "github.com/APIParkLab/APIPark/resources/access"
	_ "github.com/APIParkLab/APIPark/resources/permit"
	_ "github.com/APIParkLab/APIPark/resources/plugin"
)

func doCheck() {
}
