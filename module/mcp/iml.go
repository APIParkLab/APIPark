package mcp

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/APIParkLab/APIPark/service/subscribe"

	"github.com/getkin/kin-openapi/openapi3"

	"gorm.io/gorm"

	"github.com/APIParkLab/APIPark/service/release"

	mcp_dto "github.com/APIParkLab/APIPark/module/mcp/dto"
	"github.com/eolinker/go-common/utils"

	api_doc "github.com/APIParkLab/APIPark/service/api-doc"

	application_authorization "github.com/APIParkLab/APIPark/service/application-authorization"

	"github.com/APIParkLab/APIPark/service/service"

	"github.com/mark3labs/mcp-go/mcp"
)

var _ IMcpModule = (*imlMcpModule)(nil)

var (
	openapi3Loader = openapi3.NewLoader()
)

type imlMcpModule struct {
	serviceService          service.IServiceService                         `autowired:""`
	appService              service.IServiceService                         `autowired:""`
	appAuthorizationService application_authorization.IAuthorizationService `autowired:""`
	apiDocService           api_doc.IAPIDocService                          `autowired:""`
	subscriberService       subscribe.ISubscribeService                     `autowired:""`
	releaseService          release.IReleaseService                         `autowired:""`
}

func (i *imlMcpModule) subscribeServiceIds(ctx context.Context, appId string) ([]string, error) {
	subscribes, err := i.subscriberService.SubscriptionsByApplication(ctx, appId)
	if err != nil {
		return nil, fmt.Errorf("get subscriber error: %w,app id is %s", err, appId)
	}
	serviceIds := utils.SliceToSlice(subscribes, func(s *subscribe.Subscribe) string {
		return s.Service
	}, func(s *subscribe.Subscribe) bool {
		return s.ApplyStatus == subscribe.ApplyStatusSubscribe
	})
	if len(serviceIds) == 0 {
		return nil, fmt.Errorf("no subscriber found,app id is %s", appId)
	}
	return serviceIds, nil
}

func (i *imlMcpModule) Services(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {

	keyword, _ := req.GetArguments()["keyword"].(string)
	appId := utils.Label(ctx, "app")
	condition := map[string]interface{}{
		"as_server": true,
	}
	if appId != "" {
		serviceIds, err := i.subscribeServiceIds(ctx, appId)
		if err != nil {
			return nil, fmt.Errorf("get subscriber service ids error: %w,app id is %s", err, appId)
		}
		condition["uuid"] = serviceIds
	}

	list, err := i.serviceService.Search(ctx, keyword, condition, "update_at desc")
	if err != nil {
		return nil, fmt.Errorf("search service error: %w", err)
	}
	if len(list) == 0 {
		list, err = i.serviceService.Search(ctx, "", condition, "update_at desc")
		if err != nil {
			return nil, fmt.Errorf("search service error: %w", err)
		}
	}
	result := make([]*mcp_dto.Service, 0, len(list))
	for _, s := range list {
		serviceRelease, err := i.releaseService.GetRunning(ctx, s.Id)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, fmt.Errorf("get service release error: %w,service id is %s", err, s.Id)
			}
			continue
		}
		_, _, apiDocRelease, _, _, err := i.releaseService.GetReleaseInfos(ctx, serviceRelease.UUID)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, fmt.Errorf("get service release info error: %w,service id is %s", err, s.Id)
			}
			continue
		}
		commit, err := i.apiDocService.GetDocCommit(ctx, apiDocRelease.Commit)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, fmt.Errorf("get api doc release error: %w,service id is %s", err, s.Id)
			}
			continue
		}
		T, err := openapi3Loader.LoadFromData([]byte(commit.Data.Content))
		if err != nil {
			return nil, fmt.Errorf("load openapi3 error: %w,service id is %s", err, s.Id)
		}
		apis := make([]*mcp_dto.API, 0, len(T.Paths.Map()))
		for path, v := range T.Paths.Map() {
			for method, opt := range v.Operations() {
				apis = append(apis, &mcp_dto.API{
					Name:        opt.Summary,
					Method:      method,
					Path:        path,
					Description: opt.Description,
				})
			}
		}
		result = append(result, &mcp_dto.Service{
			Id:          s.Id,
			Name:        s.Name,
			Description: s.Name,
			ServiceKind: s.Kind.String(),
			CreateTime:  s.CreateTime,
			UpdateTime:  s.UpdateTime,
			Apis:        apis,
		})
	}
	data, _ := json.Marshal(result)
	return mcp.NewToolResultText(string(data)), nil

}

func (i *imlMcpModule) APIs(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	serviceId, _ := req.GetArguments()["service"].(string)
	if serviceId == "" {
		return nil, fmt.Errorf("service id is empty")
	}
	s, err := i.serviceService.Get(ctx, serviceId)
	if err != nil {
		return nil, fmt.Errorf("get service error: %w,service id is %s", err, serviceId)
	}
	appId := utils.Label(ctx, "app")
	if appId != "" {
		subscribers, err := i.subscriberService.ListByApplication(ctx, serviceId, appId)
		if err != nil {
			return nil, fmt.Errorf("get subscriber error: %w,app id is %s", err, appId)
		}
		if len(subscribers) < 1 || subscribers[0].ApplyStatus != subscribe.ApplyStatusSubscribe {
			return nil, fmt.Errorf("no subscriber found,app id is %s", appId)
		}
	}

	serviceRelease, err := i.releaseService.GetRunning(ctx, serviceId)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("get service release error: %w,service id is %s", err, s.Id)
		}
		return nil, fmt.Errorf("no service found,service id is %s", serviceId)
	}
	_, _, apiDocRelease, _, _, err := i.releaseService.GetReleaseInfos(ctx, serviceRelease.UUID)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("get service release info error: %w,service id is %s", err, s.Id)
		}
		return nil, fmt.Errorf("no service found,service id is %s", serviceId)
	}
	commit, err := i.apiDocService.GetDocCommit(ctx, apiDocRelease.Commit)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("get api doc release error: %w,service id is %s", err, s.Id)
		}
		return nil, fmt.Errorf("no service found,service id is %s", serviceId)
	}
	T, err := openapi3Loader.LoadFromData([]byte(commit.Data.Content))
	if err != nil {
		return nil, fmt.Errorf("load openapi3 error: %w,service id is %s", err, s.Id)
	}

	result := &mcp_dto.ServiceAPI{
		ServiceID:   serviceId,
		ServiceName: s.Name,
		APIDoc:      T,
	}
	data, _ := json.Marshal(result)
	return mcp.NewToolResultText(string(data)), nil
}

var (
	client = &http.Client{}
)

func (i *imlMcpModule) Invoke(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	gatewayInvoke := utils.GatewayInvoke(ctx)

	if gatewayInvoke == "" {
		return nil, fmt.Errorf("gateway invoke is required")
	}
	u, err := url.Parse(gatewayInvoke)
	if err != nil {
		return nil, fmt.Errorf("parse gateway invoke error: %w", err)
	}
	if u.Scheme == "" {
		u.Scheme = "http"
	}

	path, ok := req.GetArguments()["path"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid path")
	}
	u.Path = fmt.Sprintf("%s/%s", strings.TrimSuffix(u.Path, "/"), strings.TrimPrefix(path, "/"))

	method, ok := req.GetArguments()["method"].(string)
	if !ok {
		method = "GET"
	}
	queryParam := url.Values{}
	query, ok := req.GetArguments()["query"].(map[string]interface{})
	if ok {
		for k, v := range query {
			switch v := v.(type) {
			case string:
				queryParam.Add(k, v)
			case []string:
				for _, value := range v {
					queryParam.Add(k, value)
				}
			case float64:
				queryParam.Add(k, strconv.FormatFloat(v, 'f', -1, 64))
			default:
				return nil, fmt.Errorf("invalid query param type: %T", v)
			}
		}
	}
	u.RawQuery = queryParam.Encode()
	headerParam := http.Header{}
	header, ok := req.GetArguments()["header"].(map[string]interface{})
	if ok {
		for k, v := range header {
			switch v := v.(type) {
			case string:
				headerParam.Set(k, v)
			case []string:
				for _, value := range v {
					headerParam.Set(k, value)
				}
			default:
				return nil, fmt.Errorf("invalid header param type: %T", v)
			}
		}
	}

	body, ok := req.GetArguments()["body"].(string)
	if !ok {
		body = ""
	}

	contentType, ok := req.GetArguments()["content-type"].(string)
	if !ok {
		contentType = "application/json"
	}
	request, err := http.NewRequest(method, u.String(), strings.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("new request error: %w", err)
	}
	request.Header = headerParam
	request.Header.Set("Content-Type", contentType)
	apikey := utils.Label(ctx, "apikey")

	if apikey != "" {
		appId := utils.Label(ctx, "app")
		if appId == "" {
			request.Header.Set("Authorization", utils.Md5(apikey))
		} else {
			request.Header.Set("Authorization", apikey)
		}
	}

	resp, err := client.Do(request)
	if err != nil {
		return nil, fmt.Errorf("request error: %w", err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response error: %w", err)
	}
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("response error: %s", string(data))
	}
	return mcp.NewToolResultText(string(data)), nil
}
