package admin

import "context"

type adminClient struct {
	address []string
}

func (a *adminClient) Info(ctx context.Context) (*Info, error) {
	return callHttp[Info](ctx, a.address, "GET", "/system/info", nil)
}

func Admin(address ...string) IApintoAdmin {
	return &adminClient{address: formatAddr(address)}
}
func (a *adminClient) Version(ctx context.Context) (*Version, error) {
	return callHttp[Version](ctx, a.address, "GET", "/system/version", nil)
}
func (a *adminClient) Ping(ctx context.Context) error {
	_, err := a.Version(ctx)
	if err != nil {
		return err
	}
	return err
}
