package service

import (
	"bufio"
	"encoding/json"
	"strings"
)

// ChatCompletionChunk represents the structure of a single chunk in the streaming response
type ChatCompletionChunk struct {
	Object  string   `json:"object"`
	Choices []Choice `json:"choices"`
}

// ChatCompletion represents the structure of a non-streaming response
type ChatCompletion struct {
	Object  string       `json:"object"`
	Choices []FullChoice `json:"choices"`
}

// Choice represents a choice in the streaming chunk
type Choice struct {
	Delta        Delta   `json:"delta"`
	FinishReason *string `json:"finish_reason"`
}

// FullChoice represents a choice in the non-streaming response
type FullChoice struct {
	Message Message `json:"message"`
}

// Delta represents the delta content in a streaming choice
type Delta struct {
	Content string `json:"content"`
	Role    string `json:"role,omitempty"`
}

// Message represents the message content in a non-streaming choice
type Message struct {
	Content string `json:"content"`
	Role    string `json:"role"`
}

// ParseAIResponse parses both streaming and non-streaming AI responses and returns the concatenated content
func parseAIResponse(input string) (string, error) {
	// First, try to parse as a non-streaming response
	var nonStreaming ChatCompletion
	if err := json.Unmarshal([]byte(input), &nonStreaming); err == nil && nonStreaming.Object == "chat.completion" {
		var result strings.Builder
		for _, choice := range nonStreaming.Choices {
			result.WriteString(choice.Message.Content)
		}
		return result.String(), nil
	}

	// If not non-streaming, parse as streaming response
	var result strings.Builder
	scanner := bufio.NewScanner(strings.NewReader(input))

	for scanner.Scan() {
		line := scanner.Text()
		// Skip empty lines or [DONE]
		if line == "" || line == "data: [DONE]" {
			continue
		}

		// Check if line starts with "data: "
		if !strings.HasPrefix(line, "data: ") {
			continue
		}

		// Extract JSON data
		jsonData := strings.TrimPrefix(line, "data: ")
		var chunk ChatCompletionChunk
		if err := json.Unmarshal([]byte(jsonData), &chunk); err != nil {
			return "", err
		}

		// Process each choice
		for _, choice := range chunk.Choices {
			// Append content from delta
			result.WriteString(choice.Delta.Content)
			// Check if this is the final chunk
			if choice.FinishReason != nil && *choice.FinishReason == "stop" {
				return result.String(), nil
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return "", err
	}

	return result.String(), nil
}

func parseAIRequest(ori string) string {
	type aiRequest struct {
		Messages []struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"messages"`
	}
	var req aiRequest
	err := json.Unmarshal([]byte(ori), &req)
	if err != nil {
		return ori
	}
	size := len(req.Messages)
	if size == 0 {
		return ""
	}

	return req.Messages[size-1].Content
}
