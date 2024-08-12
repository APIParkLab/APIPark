package entity

import (
	"encoding/json"
)

type BasicInfo struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Driver      string            `json:"driver"`
	Version     string            `json:"version"`
	Matches     map[string]string `json:"matches"`
}

type WorkerItem[T any] struct {
	Basic *BasicInfo
	Attr  *T
}

func NewWorkerItem[T any](basic *BasicInfo, attr *T) *WorkerItem[T] {
	return &WorkerItem[T]{Basic: basic, Attr: attr}
}

func (w *WorkerItem[T]) MarshalJSON() ([]byte, error) {
	data, err := json.Marshal(w.Attr)
	if err != nil {
		return nil, err
	}

	attr := make(map[string]interface{})
	err = json.Unmarshal(data, &attr)
	if err != nil {
		return nil, err
	}
	attr["id"] = w.Basic.ID
	attr["name"] = w.Basic.Name
	attr["description"] = w.Basic.Description
	attr["driver"] = w.Basic.Driver
	attr["version"] = w.Basic.Version
	attr["matches"] = w.Basic.Matches

	return json.Marshal(attr)
}

func (w *WorkerItem[T]) UnmarshalJSON(bytes []byte) error {
	attr := new(T)
	err := json.Unmarshal(bytes, attr)
	if err != nil {
		return err
	}
	basicInfo := new(BasicInfo)
	err = json.Unmarshal(bytes, basicInfo)
	if err != nil {
		return err
	}
	w.Basic = basicInfo
	w.Attr = attr
	return nil
}
