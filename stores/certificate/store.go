package certificate

import (
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
	"reflect"
)

type ICertificateStore interface {
	store.IBaseStore[Certificate]
}
type ICertificateFileStore interface {
	store.IBaseStore[File]
}

type imlCertificateStore struct {
	store.Store[Certificate]
}

type imlCertificateFileStore struct {
	store.Store[File]
}

func init() {
	autowire.Auto[ICertificateStore](func() reflect.Value {
		return reflect.ValueOf(new(imlCertificateStore))
	})
	autowire.Auto[ICertificateFileStore](func() reflect.Value {
		return reflect.ValueOf(new(imlCertificateFileStore))
	})

}
