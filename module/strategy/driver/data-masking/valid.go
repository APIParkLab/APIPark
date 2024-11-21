package data_masking

var validMatchInnerValues = map[string]struct{}{
	"name":      {},
	"phone":     {},
	"email":     {},
	"id-card":   {},
	"bank-card": {},
	"date":      {},
	"amount":    {},
}
var validMatchTypes = map[string]struct{}{
	"inner":     {},
	"keyword":   {},
	"regex":     {},
	"json_path": {},
}

var validMaskTypes = map[string]struct{}{
	"partial-display": {},
	"partial-masking": {},
	"truncation":      {},
	"replacement":     {},
	"shuffling":       {},
}

var validReplaceTypes = map[string]struct{}{
	"random": {},
	"custom": {},
}
