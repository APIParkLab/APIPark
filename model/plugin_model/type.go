package plugin_model

import (
	"database/sql/driver"
	"encoding/json"
)

type Kind int

func (k *Kind) UnmarshalJSON(bytes []byte) error {
	str := ""

	err := json.Unmarshal(bytes, &str)
	if err != nil {
		return err
	}
	*k = ParseKind(str)
	return nil
}

func (k *Kind) MarshalJSON() ([]byte, error) {
	return json.Marshal(k.String())
}

func (k *Kind) String() string {
	switch *k {
	case InnerKind:
		return "inner"

	case OpenKind:
		return "global"
	default:
		return "unknown"

	}
}

func (k *Kind) Scan(src any) error {
	switch v := src.(type) {
	case string:
		*k = ParseKind(v)
	case []byte:
		*k = ParseKind(string(v))
	case int:
		*k = Kind(v)
	case int64:
		*k = Kind(v)
	case int32:
		*k = Kind(v)
	case int16:
		*k = Kind(v)
	case int8:
		*k = Kind(v)
	case uint:
		*k = Kind(v)
	case uint64:
		*k = Kind(v)
	case uint32:
		*k = Kind(v)
	case uint16:
		*k = Kind(v)
	case uint8:
		*k = Kind(v)

	default:
		*k = OpenKind
	}
	return nil
}

func ParseKind(string2 string) Kind {
	switch string2 {
	case "inner", "0":
		return InnerKind
	case "global", "1":
		return OpenKind
	default:
		return OpenKind
	}
}

func (k *Kind) Value() (driver.Value, error) {
	if *k == unKnownKind {
		return OpenKind, nil
	}
	return *k, nil
}

const (
	InnerKind Kind = iota
	OpenKind
	unKnownKind
)
const (
	Enable Status = iota
	Global
	Disable
	unKnownStatus
)

type Status int

func (s *Status) UnmarshalJSON(bytes []byte) error {
	str := ""
	err := json.Unmarshal(bytes, &str)
	if err != nil {
		return err
	}
	*s = ParseStatus(str)
	return nil
}

func (s *Status) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}

func (s *Status) Scan(src any) error {
	switch v := src.(type) {
	case string:
		*s = ParseStatus(v)
	case []byte:
		*s = ParseStatus(string(v))
	case int:
		*s = Status(v)
	case int64:
		*s = Status(v)
	case int32:
		*s = Status(v)
	case int16:
		*s = Status(v)
	case int8:
		*s = Status(v)
	case uint:
		*s = Status(v)
	case uint64:
		*s = Status(v)
	case uint32:
		*s = Status(v)
	case uint16:
		*s = Status(v)
	case uint8:
		*s = Status(v)
	default:
		*s = Enable

	}
	return nil
}

func (s *Status) String() string {
	switch *s {
	case Enable:
		return "enable"
	case Global:
		return "global"
	case Disable:
		return "disable"
	default:
		return "unknown"
	}

}

func ParseStatus(string2 string) Status {
	switch string2 {
	case "enable", "0":
		return Enable
	case "disable", "2":
		return Disable
	case "global", "1":
		return Global
	default:
		return unKnownStatus
	}
}
