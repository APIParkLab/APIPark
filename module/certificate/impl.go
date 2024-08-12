package certificate

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"time"
	
	"github.com/eolinker/eosc/log"
	"gorm.io/gorm"
	
	"github.com/APIParkLab/APIPark/gateway"
	
	"github.com/google/uuid"
	
	"github.com/APIParkLab/APIPark/service/cluster"
	"github.com/eolinker/go-common/store"
	
	certificatedto "github.com/APIParkLab/APIPark/module/certificate/dto"
	"github.com/APIParkLab/APIPark/service/certificate"
	"github.com/eolinker/ap-account/service/account"
	"github.com/eolinker/go-common/utils"
)

var (
	_ ICertificateModule = (*imlCertificate)(nil)
)

type imlCertificate struct {
	service         certificate.ICertificateService `autowired:""`
	userInfoService account.IAccountService         `autowired:""`
	clusterService  cluster.IClusterService         `autowired:""`
	transaction     store.ITransaction              `autowired:""`
}

func (m *imlCertificate) getCertificates(ctx context.Context, clusterId string) ([]*gateway.DynamicRelease, error) {
	certs, err := m.service.List(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	publishCerts := make([]*gateway.DynamicRelease, 0, len(certs))
	for _, cert := range certs {
		_, certFile, err := m.service.Get(ctx, cert.ID)
		if err != nil {
			return nil, err
		}
		publishCerts = append(publishCerts, &gateway.DynamicRelease{
			BasicItem: &gateway.BasicItem{
				ID:          cert.ID,
				Description: "",
				Version:     cert.UpdateTime.Format("20060102150405"),
				MatchLabels: map[string]string{
					"module": "certificate",
				},
			},
			Attr: map[string]interface{}{
				"key": certFile.Key,
				"pem": certFile.Cert,
			},
		})
	}
	return publishCerts, nil
}

func (m *imlCertificate) initGateway(ctx context.Context, clusterId string, clientDriver gateway.IClientDriver) error {
	certificateClient, err := clientDriver.Dynamic("certificate")
	if err != nil {
		return err
	}
	certs, err := m.getCertificates(ctx, clusterId)
	if err != nil {
		return err
	}
	return certificateClient.Online(ctx, certs...)
}

func (m *imlCertificate) save(ctx context.Context, id string, clusterId string, create *certificatedto.FileInput) (*certificatedto.Certificate, error) {
	
	keyData, err := base64.StdEncoding.DecodeString(create.Key)
	if err != nil {
		
		return nil, fmt.Errorf("decode key error: %w", err)
	}
	certData, err := base64.StdEncoding.DecodeString(create.Cert)
	if err != nil {
		return nil, fmt.Errorf("decode cert error: %w", err)
	}
	o, err := m.service.Save(ctx, id, clusterId, keyData, certData)
	if err != nil {
		return nil, err
	}
	out := certificatedto.FromModel(o)
	return out, nil
}

func (m *imlCertificate) syncGateway(ctx context.Context, clusterId string, releaseInfo *gateway.DynamicRelease, online bool) error {
	client, err := m.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		return err
	}
	defer func() {
		err := client.Close(ctx)
		if err != nil {
			log.Warn("close apinto client:", err)
		}
	}()
	dynamicClient, err := client.Dynamic("certificate")
	if err != nil {
		return err
	}
	if online {
		return dynamicClient.Online(ctx, releaseInfo)
	}
	return dynamicClient.Offline(ctx, releaseInfo)
}

func (m *imlCertificate) Create(ctx context.Context, create *certificatedto.FileInput) error {
	
	return m.transaction.Transaction(ctx, func(ctx context.Context) error {
		id := uuid.New().String()
		version := time.Now().Format("20060102150405")
		err := m.syncGateway(ctx, cluster.DefaultClusterID, &gateway.DynamicRelease{
			BasicItem: &gateway.BasicItem{
				ID:          id,
				Description: "",
				Version:     version,
				MatchLabels: map[string]string{
					"module": "certificate",
				},
			},
			Attr: map[string]interface{}{
				"key": create.Key,
				"pem": create.Cert,
			},
		}, true)
		if err != nil {
			return err
		}
		_, err = m.save(ctx, id, cluster.DefaultClusterID, create)
		if err != nil {
			return err
		}
		return nil
	})
	
}

func (m *imlCertificate) Update(ctx context.Context, id string, edit *certificatedto.FileInput) error {
	old, _, err := m.service.Get(ctx, id)
	if err != nil {
		return err
	}
	clusters, err := m.clusterService.ListByClusters(ctx, old.Cluster)
	if err != nil {
		return err
	}
	return m.transaction.Transaction(ctx, func(ctx context.Context) error {
		version := time.Now().Format("20060102150405")
		for _, c := range clusters {
			err = m.syncGateway(ctx, c.Uuid, &gateway.DynamicRelease{
				BasicItem: &gateway.BasicItem{
					ID:          id,
					Description: "",
					Version:     version,
					MatchLabels: map[string]string{
						"module": "certificate",
					},
				},
				Attr: map[string]interface{}{
					"key": edit.Key,
					"pem": edit.Cert,
				},
			}, true)
			if err != nil {
				return err
			}
		}
		_, err = m.save(ctx, id, old.Cluster, edit)
		if err != nil {
			return err
		}
		return nil
	})
}
func (m *imlCertificate) List(ctx context.Context) ([]*certificatedto.Certificate, error) {
	certs, err := m.service.List(ctx, cluster.DefaultClusterID)
	if err != nil {
		return nil, err
	}
	outList := utils.SliceToSlice(certs, certificatedto.FromModel)
	return outList, nil
}

func (m *imlCertificate) Detail(ctx context.Context, id string) (*certificatedto.Certificate, *certificatedto.File, error) {
	get, f, err := m.service.Get(ctx, id)
	if err != nil {
		return nil, nil, err
	}
	out := certificatedto.FromModel(get)
	return out, &certificatedto.File{
		Key:  base64.RawStdEncoding.EncodeToString(f.Key),
		Cert: base64.RawStdEncoding.EncodeToString(f.Cert),
	}, nil
}

func (m *imlCertificate) Delete(ctx context.Context, id string) error {
	cert, _, err := m.service.Get(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}
	clusters, err := m.clusterService.ListByClusters(ctx, cert.Cluster)
	if err != nil {
		return err
	}
	return m.transaction.Transaction(ctx, func(ctx context.Context) error {
		for _, c := range clusters {
			err = m.syncGateway(ctx, c.Uuid, &gateway.DynamicRelease{
				BasicItem: &gateway.BasicItem{
					ID:          id,
					Description: "",
				},
			}, false)
			if err != nil {
				return err
			}
		}
		return m.service.Delete(ctx, id)
	})
}
