package feishu

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"

	"github.com/eolinker/go-common/autowire"

	"github.com/eolinker/ap-account/service/role"
	"github.com/eolinker/ap-account/service/user"

	"github.com/eolinker/go-common/utils"

	"github.com/google/uuid"

	"gorm.io/gorm"

	"github.com/eolinker/ap-account/service/account"

	"github.com/eolinker/ap-account/auth_driver"
)

const (
	name           = "feishu"
	title          = "飞书"
	getTokenUri    = "https://open.feishu.cn/open-apis/authen/v2/oauth/token"
	getUserInfoUri = "https://open.feishu.cn/open-apis/authen/v1/user_info"
)

var _ auth_driver.IDriver = (*Driver)(nil)

func init() {
	d := &Driver{}

	auth_driver.Register(name, d)
}

type Driver struct {
	isInit            bool
	accountService    account.IAccountService `autowired:""`
	userService       user.IUserService       `autowired:""`
	roleService       role.IRoleService       `autowired:""`
	roleMemberService role.IRoleMemberService `autowired:""`
}

func (d *Driver) Init() {
	if d.isInit {
		return
	}
	autowire.Autowired(&d.accountService)
	autowire.Autowired(&d.userService)
	autowire.Autowired(&d.roleService)
	autowire.Autowired(&d.roleMemberService)
	d.isInit = true
}

func (d *Driver) FilterConfig(config map[string]string) {
	delete(config, "client_secret")
}

func (d *Driver) Name() string {
	return name
}

func (d *Driver) Title() string {
	return title
}

func (d *Driver) ThirdLogin(ctx context.Context, args map[string]string) (string, error) {
	code, ok := args["code"]
	if !ok {
		return "", fmt.Errorf("missing code parameter")
	}
	clientId, ok := args["client_id"]
	if !ok {
		return "", fmt.Errorf("missing client_id parameter")
	}
	clientSecret, ok := args["client_secret"]
	if !ok {
		return "", fmt.Errorf("missing client_secret parameter")
	}
	redirectUri, ok := args["redirect_uri"]
	if !ok {
		return "", fmt.Errorf("missing redirect_uri parameter")
	}
	u, err := url.Parse(redirectUri)
	if err != nil {
		return "", fmt.Errorf("invalid redirect_uri parameter")
	}
	query := u.Query()
	query.Del("code")
	redirectUri = fmt.Sprintf("%s://%s%s", u.Scheme, u.Host, u.Path)
	if len(query) > 0 {
		redirectUri = fmt.Sprintf("%s?%s", redirectUri, query.Encode())
	}
	tokenResp, err := getUserToken(code, redirectUri, clientId, clientSecret)
	if err != nil {
		return "", err
	}
	userInfoResp, err := getUserInfo(tokenResp.TokenType, tokenResp.AccessToken)
	if err != nil {
		return "", err
	}
	userId := userInfoResp.Data.UnionId
	username := userInfoResp.Data.Name
	email := userInfoResp.Data.Email
	mobile := userInfoResp.Data.Mobile
	info, err := d.accountService.GetIdentifier(ctx, name, userId)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return "", err
		}
		uId := uuid.NewString()

		err = d.accountService.Save(ctx, name, uId, userId, utils.Md5(fmt.Sprintf("%s%s", uId, userId)))
		if err != nil {
			return "", err
		}
		_, err = d.userService.Create(ctx, uId, username, email, mobile, name)
		if err != nil {
			return "", err
		}
		r, err := d.roleService.GetDefaultRole(ctx, role.SystemTarget())
		if err != nil {
			return "", err
		}
		err = d.roleMemberService.Add(ctx, &role.AddMember{
			Role:   r.Id,
			User:   uId,
			Target: role.SystemTarget(),
		})
		if err != nil {
			return "", err
		}
		return uId, nil
	}
	_, err = d.userService.Update(ctx, info.Uid, &username, &email, &mobile)
	if err != nil {
		return "", err
	}

	return info.Uid, nil
}

func getUserToken(code string, redirectUri, clientId string, clientSecret string) (*UserTokenResponse, error) {
	headers := http.Header{}
	headers.Set("Content-Type", "application/json")
	//body := url.Values{}
	//body.Set("grant_type", "authorization_code")
	//body.Set("code", code)
	//body.Set("client_id", clientId)
	//body.Set("client_secret", clientSecret)
	//body.Set("redirect_uri", redirectUri)
	body := map[string]string{
		"grant_type":    "authorization_code",
		"code":          code,
		"client_id":     clientId,
		"client_secret": clientSecret,
		"redirect_uri":  redirectUri,
	}
	bodyByte, _ := json.Marshal(body)
	resp, err := SendRequest[UserTokenResponse](getTokenUri, http.MethodPost, headers, nil, bodyByte)
	if err != nil {
		return nil, fmt.Errorf("failed to get user token: %w", err)
	}
	if resp.Code != 0 {
		return nil, fmt.Errorf("failed to get user token: %s", resp.ErrorDescription)
	}
	return resp, nil
}

func getUserInfo(tokenType string, token string) (*UserInfoResponse, error) {
	headers := http.Header{}
	headers.Set("Content-Type", "application/json")
	switch tokenType {
	case "Bearer":
		headers.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	}
	resp, err := SendRequest[UserInfoResponse](getUserInfoUri, http.MethodGet, headers, nil, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	if resp.Code != 0 {
		return nil, fmt.Errorf("failed to get user info: %s", resp.Msg)
	}
	return resp, nil
}

func (d *Driver) Delete(ctx context.Context, ids ...string) error {
	return d.accountService.OnRemoveUsers(ctx, ids...)
}
