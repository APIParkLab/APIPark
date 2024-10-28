package version

import (
	"bytes"
	"fmt"

	"github.com/urfave/cli"
)

// These should be set via go build -ldflags -X 'xxxx'.
var Version = "unknown"
var goVersion = "unknown"
var gitCommit = "unknown"
var BuildTime = "unknown"
var buildUser = "unknown"

//var eoscVersion = "unknown"

var profileInfo []byte

func init() {
	buffer := &bytes.Buffer{}
	fmt.Fprintf(buffer, "APIPark version: %s\n", Version)
	fmt.Fprintf(buffer, "Golang version: %s\n", goVersion)
	fmt.Fprintf(buffer, "Git commit hash: %s\n", gitCommit)
	fmt.Fprintf(buffer, "Built on: %s\n", BuildTime)
	fmt.Fprintf(buffer, "Built by: %s\n", buildUser)
	//fmt.Fprintf(buffer, "Built by eosc version: %s\n", eoscVersion)
	profileInfo = buffer.Bytes()
}

func Build() *cli.Command {
	return &cli.Command{
		Name: "version",
		Action: func(context *cli.Context) error {
			fmt.Print(string(profileInfo))
			return nil
		},
	}
}
