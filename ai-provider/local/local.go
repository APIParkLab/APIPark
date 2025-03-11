package ai_provider_local

import (
	"net/http"
	"net/url"

	"github.com/ollama/ollama/api"
)

var (
	client        *api.Client
	ProviderLocal = "LocalModel"
)

func ResetLocalAddress(address string) error {
	u, err := url.Parse(address)
	if err != nil {
		return err
	}
	client = api.NewClient(u, http.DefaultClient)
	return nil
}

var (
	LocalConfig = "{\n  \"temperature\": \"\",\n  \"top_p\": \"\",\n  \"max_tokens\": \"\"\n}"
	LocalSvg    = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50" height="50" viewBox="0 0 50 50">
    <image id="椭圆_1_拷贝" data-name="椭圆 1 拷贝" x="5" y="4" width="42" height="38" xlink:href="data:img/png;base64,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"/>
</svg>

`
)
