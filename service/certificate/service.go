package certificate

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"reflect"
	"time"
	
	"github.com/APIParkLab/APIPark/stores/certificate"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/utils"
	"github.com/google/uuid"
)

var (
	_ ICertificateService = (*imlCertificateService)(nil)
)

func init() {
	autowire.Auto[ICertificateService](func() reflect.Value {
		return reflect.ValueOf(new(imlCertificateService))
	})
}

type ICertificateService interface {
	Get(ctx context.Context, id string) (*Certificate, *File, error)
	List(ctx context.Context, clusterId string) ([]*Certificate, error)
	Save(ctx context.Context, id, clusterId string, key, cert []byte) (*Certificate, error)
	Delete(ctx context.Context, id string) error
}

type imlCertificateService struct {
	store certificate.ICertificateStore     `autowired:""`
	file  certificate.ICertificateFileStore `autowired:""`
}

func (s *imlCertificateService) Delete(ctx context.Context, id string) error {
	return s.store.Transaction(ctx, func(ctx context.Context) error {
		i, err := s.store.DeleteWhere(ctx, map[string]interface{}{"uuid": id})
		if err != nil {
			return err
		}
		if i == 0 {
			return nil
		}
		_, err = s.file.DeleteWhere(ctx, map[string]interface{}{"uuid": id})
		if err != nil {
			return err
		}
		return nil
		
	})
	
}

func (s *imlCertificateService) Get(ctx context.Context, id string) (*Certificate, *File, error) {
	ce, err := s.store.First(ctx, map[string]interface{}{"uuid": id})
	if err != nil {
		return nil, nil, err
	}
	fe, err := s.file.Get(ctx, ce.Id)
	if err != nil {
		return nil, nil, err
	}
	return &Certificate{
			ID:         ce.UUID,
			Cluster:    ce.Cluster,
			UpdateTime: ce.UpdateTime,
			Name:       ce.Name,
			Domains:    ce.Domains,
			NotAfter:   ce.NotAfter,
			NotBefore:  ce.NotBefore,
			Updater:    ce.Updater,
		}, &File{
			ID:   id,
			Key:  fe.Key,
			Cert: fe.Cert,
		}, nil
	
}

func (s *imlCertificateService) List(ctx context.Context, clusterId string) ([]*Certificate, error) {
	list, err := s.store.List(ctx, map[string]interface{}{"cluster": clusterId})
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, func(i *certificate.Certificate) *Certificate {
		return &Certificate{
			ID:         i.UUID,
			Name:       i.Name,
			Domains:    i.Domains,
			Cluster:    i.Cluster,
			NotAfter:   i.NotAfter,
			NotBefore:  i.NotBefore,
			Updater:    i.Updater,
			UpdateTime: i.UpdateTime,
		}
	}), nil
}

func (s *imlCertificateService) Save(ctx context.Context, id, clusterId string, key, cert []byte) (*Certificate, error) {
	if id == "" {
		id = uuid.NewString()
	}
	operator := utils.UserId(ctx)
	certDERBlock, err := ParseCert(string(key), string(cert))
	if err != nil {
		return nil, err
	}
	dnsNames := certDERBlock.Leaf.DNSNames
	if dnsNames == nil && certDERBlock.Leaf.IPAddresses != nil {
		dnsNames = make([]string, 0, len(certDERBlock.Leaf.IPAddresses))
		for _, ip := range certDERBlock.Leaf.IPAddresses {
			dnsNames = append(dnsNames, ip.String())
		}
	}
	if dnsNames == nil {
		return nil, errors.New("证书中没有包含域名或者IP地址信息")
	}
	ce := &certificate.Certificate{
		UUID:       id,
		Cluster:    clusterId,
		Name:       certDERBlock.Leaf.Subject.CommonName,
		Domains:    dnsNames,
		Updater:    operator,
		NotAfter:   certDERBlock.Leaf.NotAfter,
		NotBefore:  certDERBlock.Leaf.NotBefore,
		UpdateTime: time.Now(),
	}
	fe := &certificate.File{
		UUID: id,
		Key:  key,
		Cert: cert,
	}
	err = s.store.Transaction(ctx, func(ctx context.Context) error {
		err := s.store.Save(ctx, ce)
		if err != nil {
			return err
		}
		fe.Id = ce.Id
		return s.file.Save(ctx, fe)
		
	})
	if err != nil {
		return nil, err
	}
	
	return &Certificate{
		ID:         ce.UUID,
		Name:       ce.Name,
		Domains:    ce.Domains,
		Cluster:    ce.Cluster,
		NotAfter:   ce.NotAfter,
		NotBefore:  ce.NotBefore,
		Updater:    ce.Updater,
		UpdateTime: ce.UpdateTime,
	}, nil
	
}

//func parseCert(crt []byte) (*x509.Certificate, error) {
//
//	//获取下一个pem格式证书数据 -----BEGIN CERTIFICATE-----   -----END CERTIFICATE-----
//	certDERBlock, _ := pem.Decode(crt)
//	if certDERBlock == nil {
//		return nil, fmt.Errorf("pem.Decode failed")
//	}
//
//	//第一个叶子证书就是我们https中使用的证书
//	x509Cert, err := x509.ParseCertificate(certDERBlock.Bytes)
//	if err != nil {
//
//		return nil, fmt.Errorf("x509.ParseCertificate failed:%w", err)
//	}
//	return x509Cert, nil
//}

func ParseCert(privateKey, pemValue string) (*tls.Certificate, error) {
	var cert tls.Certificate
	//获取下一个pem格式证书数据 -----BEGIN CERTIFICATE-----   -----END CERTIFICATE-----
	certDERBlock, restPEMBlock := pem.Decode([]byte(pemValue))
	if certDERBlock == nil {
		return nil, errors.New("证书解析失败")
	}
	//附加数字证书到返回
	cert.Certificate = append(cert.Certificate, certDERBlock.Bytes)
	//继续解析Certificate Chan,这里要明白证书链的概念
	certDERBlockChain, _ := pem.Decode(restPEMBlock)
	if certDERBlockChain != nil {
		//追加证书链证书到返回
		cert.Certificate = append(cert.Certificate, certDERBlockChain.Bytes)
	}
	
	//解码pem格式的私钥------BEGIN RSA PRIVATE KEY-----   -----END RSA PRIVATE KEY-----
	keyDERBlock, _ := pem.Decode([]byte(privateKey))
	if keyDERBlock == nil {
		return nil, errors.New("证书解析失败")
	}
	var key interface{}
	var errParsePK error
	if keyDERBlock.Type == "RSA PRIVATE KEY" {
		//RSA PKCS1
		key, errParsePK = x509.ParsePKCS1PrivateKey(keyDERBlock.Bytes)
	} else if keyDERBlock.Type == "PRIVATE KEY" {
		//pkcs8格式的私钥解析
		key, errParsePK = x509.ParsePKCS8PrivateKey(keyDERBlock.Bytes)
	}
	
	if errParsePK != nil {
		return nil, errors.New("证书解析失败")
	} else {
		cert.PrivateKey = key
	}
	//第一个叶子证书就是我们https中使用的证书
	x509Cert, err := x509.ParseCertificate(certDERBlock.Bytes)
	if err != nil {
		return nil, err
	}
	cert.Leaf = x509Cert
	return &cert, nil
}
