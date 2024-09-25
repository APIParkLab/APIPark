package openAI

import (
	_ "embed"
	"encoding/json"
	"github.com/APIParkLab/APIPark/module/ai/provider"
	"github.com/eolinker/eosc"
	"sync"
)

func Register() {
	provider.Register("openai", NewModel())
}

var (
	//go:embed model.json
	modelJson []byte
)

type ModelData struct {
	Id       string   `json:"id"`
	OwnedBy  string   `json:"owned_by"`
	Logo     string   `json:"logo"`
	Scopes   []string `json:"scopes"`
	Features []string `json:"features"`
}

type Model struct {
	globalConfig provider.IAIConfig
	invokeConfig provider.IAIConfig
	models       eosc.Untyped[string, *ModelData]
	locker       sync.RWMutex
}

func NewModel() provider.IAIProvider {
	modelData := make([]*ModelData, 0)
	json.Unmarshal(modelJson, &modelData)
	m := &Model{
		globalConfig: NewGlobalConfigDriver(),
		invokeConfig: NewInvokeConfigDriver(),
		models:       eosc.BuildUntyped[string, *ModelData](),
		locker:       sync.RWMutex{},
	}
	for _, v := range modelData {
		m.models.Set(v.Id, v)
	}
	return m
}

func (m *Model) Index() int {
	return 1
}

func (m *Model) Info() *provider.Info {
	return &provider.Info{
		Id:   "openai",
		Name: "OpenAI",
		Logo: `<svg width="80" height="22" viewBox="0 0 80 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="Group">
        <path id="Vector" d="M25.1152 10.5768C25.1152 14.1739 27.4253 16.6819 30.6264 16.6819C33.8274 16.6819 36.1375 14.1739 36.1375 10.5768C36.1375 6.97973 33.8274 4.47168 30.6264 4.47168C27.4253 4.47168 25.1152 6.97973 25.1152 10.5768ZM34.0254 10.5768C34.0254 13.1509 32.6229 14.8174 30.6264 14.8174C28.6298 14.8174 27.2273 13.1509 27.2273 10.5768C27.2273 8.00275 28.6298 6.33622 30.6264 6.33622C32.6229 6.33622 34.0254 8.00275 34.0254 10.5768Z" fill="black"/>
        <path id="Vector_2" d="M42.0868 16.682C44.5124 16.682 45.8984 14.636 45.8984 12.1774C45.8984 9.71889 44.5124 7.67285 42.0868 7.67285C40.9648 7.67285 40.1398 8.11836 39.5953 8.76188V7.83786H37.6152V19.4706H39.5953V15.593C40.1398 16.2365 40.9648 16.682 42.0868 16.682ZM39.5458 11.9299C39.5458 10.2964 40.4698 9.40539 41.6908 9.40539C43.1264 9.40539 43.9019 10.5274 43.9019 12.1774C43.9019 13.8275 43.1264 14.9495 41.6908 14.9495C40.4698 14.9495 39.5458 14.042 39.5458 12.4415V11.9299Z" fill="black"/>
        <path id="Vector_3" d="M51.2545 16.682C52.987 16.682 54.3565 15.7745 54.967 14.2565L53.2675 13.613C53.0035 14.504 52.228 14.999 51.2545 14.999C49.9839 14.999 49.0929 14.0915 48.9444 12.6065H55.0165V11.9464C55.0165 9.57039 53.68 7.67285 51.172 7.67285C48.6639 7.67285 47.0469 9.63639 47.0469 12.1774C47.0469 14.8505 48.7794 16.682 51.2545 16.682ZM51.1555 9.33939C52.4095 9.33939 53.0035 10.1644 53.02 11.1214H49.0434C49.3404 9.9499 50.1324 9.33939 51.1555 9.33939Z" fill="black"/>
        <path id="Vector_4" d="M56.5038 16.5005H58.4838V11.4184C58.4838 10.1809 59.3913 9.52089 60.2824 9.52089C61.3714 9.52089 61.8004 10.2964 61.8004 11.3689V16.5005H63.7804V10.7914C63.7804 8.92688 62.6914 7.67285 60.8764 7.67285C59.7544 7.67285 58.9788 8.18436 58.4838 8.76188V7.83786H56.5038V16.5005Z" fill="black"/>
        <path id="Vector_5" d="M69.5799 4.65332L65.0918 16.5006H67.1873L68.1939 13.7945H73.309L74.332 16.5006H76.4605L71.9724 4.65332H69.5799ZM70.7349 6.99637L72.616 11.9465H68.8869L70.7349 6.99637Z" fill="black"/>
        <path id="Vector_6" d="M79.8581 4.6875H77.7461V16.5348H79.8581V4.6875Z" fill="black"/>
        <path id="Vector_7" d="M20.2769 9.00448C20.776 7.50639 20.6041 5.86529 19.8059 4.50264C18.6055 2.41259 16.1924 1.33732 13.8356 1.84333C12.7871 0.662179 11.2808 -0.00952316 9.70154 0.000102043C7.29248 -0.00539807 5.155 1.54563 4.41386 3.83781C2.86626 4.15475 1.53042 5.12346 0.748717 6.49643C-0.460621 8.58097 -0.184928 11.2087 1.43073 12.9962C0.931596 14.4943 1.10348 16.1354 1.90168 17.498C3.10208 19.5881 5.51526 20.6634 7.87206 20.1573C8.91983 21.3385 10.4269 22.0102 12.0061 21.9999C14.4165 22.0061 16.5547 20.4537 17.2958 18.1594C18.8434 17.8425 20.1793 16.8738 20.961 15.5008C22.1689 13.4163 21.8925 10.7906 20.2776 9.00311L20.2769 9.00448ZM12.0075 20.5623C11.0429 20.5637 10.1085 20.2261 9.36809 19.608C9.40178 19.5901 9.46022 19.5578 9.49803 19.5345L13.8789 17.0044C14.103 16.8772 14.2405 16.6386 14.2391 16.3808V10.2049L16.0906 11.274C16.1105 11.2836 16.1236 11.3028 16.1264 11.3248V16.4393C16.1236 18.7136 14.2818 20.5575 12.0075 20.5623ZM3.14952 16.7789C2.6662 15.9443 2.49225 14.9659 2.65795 14.0165C2.69026 14.0357 2.74732 14.0708 2.78789 14.0942L7.16873 16.6242C7.3908 16.7541 7.6658 16.7541 7.88856 16.6242L13.2367 13.5359V15.6741C13.2381 15.6961 13.2278 15.7174 13.2106 15.7311L8.78233 18.288C6.80985 19.4238 4.29079 18.7486 3.15021 16.7789H3.14952ZM1.99656 7.21626C2.47782 6.38024 3.23752 5.74085 4.14229 5.40878C4.14229 5.44659 4.14023 5.51328 4.14023 5.56003V10.6208C4.13885 10.878 4.27636 11.1165 4.4998 11.2437L9.84798 14.3313L7.9965 15.4004C7.97794 15.4128 7.95456 15.4149 7.93393 15.4059L3.50496 12.847C1.53661 11.7071 0.86147 9.18874 1.99587 7.21694L1.99656 7.21626ZM17.2085 10.7563L11.8603 7.66795L13.7118 6.59956C13.7304 6.58718 13.7537 6.58512 13.7744 6.59406L18.2033 9.15092C20.1751 10.2901 20.851 12.8126 19.7118 14.7844C19.2298 15.6191 18.4708 16.2584 17.5667 16.5912V11.3792C17.5688 11.122 17.432 10.8841 17.2092 10.7563H17.2085ZM19.0511 7.98284C19.0187 7.9629 18.9617 7.92852 18.9211 7.90515L14.5403 5.37509C14.3182 5.24515 14.0432 5.24515 13.8204 5.37509L8.47226 8.46341V6.32524C8.47088 6.30324 8.4812 6.28192 8.49838 6.26817L12.9267 3.71337C14.8991 2.57553 17.4209 3.25273 18.5581 5.2259C19.0387 6.05917 19.2126 7.03475 19.0497 7.98284H19.0511ZM7.46574 11.7937L5.61357 10.7246C5.59363 10.715 5.58057 10.6958 5.57782 10.6738V5.55935C5.5792 3.2823 7.42655 1.43701 9.7036 1.43838C10.6668 1.43838 11.5991 1.77664 12.3395 2.39265C12.3058 2.41053 12.2481 2.44284 12.2096 2.46622L7.82874 4.99627C7.60461 5.12346 7.46711 5.36134 7.46849 5.61916L7.46574 11.7924V11.7937ZM8.47157 9.62531L10.8538 8.24959L13.236 9.62462V12.3754L10.8538 13.7504L8.47157 12.3754V9.62531Z" fill="black"/>
    </g>
</svg>
`,
		GetAPIKeyUrl: "https://platform.openai.com/account/api-keys",
		DefaultLLM:   "gpt-3.5-turbo",
	}
}

func (m *Model) GlobalConfig() provider.IAIConfig {
	return m.globalConfig
}

func (m *Model) InvokeConfig() provider.IAIConfig {
	return m.invokeConfig
}

func (m *Model) UpdateLLMs() error {
	m.locker.Lock()
	defer m.locker.Unlock()
	// TODO: 后续需要实现自动更新llm逻辑
	return nil
}

func (m *Model) LLMs() []*provider.LLM {
	models := m.models
	result := make([]*provider.LLM, 0, models.Count())
	for _, model := range models.List() {
		llm := &provider.LLM{
			Id:     model.Id,
			Logo:   model.Logo,
			Scopes: model.Scopes,
		}
		result = append(result, llm)
	}
	return result
}

func (m *Model) LLM(id string) (*provider.LLM, bool) {
	model, has := m.models.Get(id)
	if !has {
		return nil, false
	}
	return &provider.LLM{
		Id:     model.Id,
		Logo:   model.Logo,
		Scopes: model.Scopes,
	}, true
}
