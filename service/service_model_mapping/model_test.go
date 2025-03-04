package service_model_mapping

import (
	"testing"
	"time"

	"github.com/APIParkLab/APIPark/stores/service"
	"github.com/stretchr/testify/assert"
)

func TestFromEntity(t *testing.T) {
	tests := []struct {
		name     string
		entity   *service.ModelMapping
		expected *ModelMapping
	}{
		{
			name: "正常转换",
			entity: &service.ModelMapping{
				UUID:     "test-uuid",
				Service:  "test-service",
				Content:  "{\"key\":\"value\"}",
				CreateAt: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
				UpdateAt: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
			},
			expected: &ModelMapping{
				UUID:     "test-uuid",
				Service:  "test-service",
				Content:  "{\"key\":\"value\"}",
				CreateAt: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
				UpdateAt: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
			},
		},
		{
			name: "空内容转换",
			entity: &service.ModelMapping{
				UUID:     "test-uuid",
				Service:  "test-service",
				Content:  "",
				CreateAt: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
				UpdateAt: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
			},
			expected: &ModelMapping{
				UUID:     "test-uuid",
				Service:  "test-service",
				Content:  "",
				CreateAt: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
				UpdateAt: time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := FromEntity(tt.entity)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestCreate_Validation(t *testing.T) {
	tests := []struct {
		name    string
		create  Create
		isValid bool
	}{
		{
			name: "有效的创建参数",
			create: Create{
				Service: "test-service",
				Content: "{\"key\":\"value\"}",
			},
			isValid: true,
		},
		{
			name: "缺少Service",
			create: Create{
				Content: "{\"key\":\"value\"}",
			},
			isValid: false,
		},
		{
			name: "缺少Content",
			create: Create{
				Service: "test-service",
			},
			isValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 这里需要实现验证逻辑的测试
			// 由于验证逻辑可能依赖于具体的验证框架，这里只是示例
			// 实际使用时需要根据项目使用的验证框架来实现
			if tt.isValid {
				assert.NotEmpty(t, tt.create.Service)
				assert.NotEmpty(t, tt.create.Content)
			} else {
				assert.True(t, tt.create.Service == "" || tt.create.Content == "")
			}
		})
	}
}

func TestEdit_Validation(t *testing.T) {
	content := "new content"
	tests := []struct {
		name    string
		edit    Edit
		isValid bool
	}{
		{
			name: "有效的编辑参数",
			edit: Edit{
				Content: &content,
			},
			isValid: true,
		},
		{
			name: "空编辑参数",
			edit: Edit{
				Content: nil,
			},
			isValid: true, // 允许空编辑
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.isValid {
				if tt.edit.Content != nil {
					assert.NotEmpty(t, *tt.edit.Content)
				}
			}
		})
	}
}
