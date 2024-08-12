package oauth2

import (
	"crypto/rand"
	"crypto/sha512"
	"encoding/base64"
	"fmt"

	"golang.org/x/crypto/pbkdf2"
)

func hashSecret(secret []byte, saltLen int, iterations int, keyLength int) (string, error) {
	if saltLen < 1 {
		saltLen = 16
	}
	salt, err := generateRandomSalt(saltLen)
	if err != nil {
		return "", err
	}
	// 迭代次数和密钥长度
	if iterations < 1 {
		iterations = 10000
	}
	if keyLength < 1 {
		keyLength = 32
	}

	// 使用 PBKDF2 密钥派生函数
	key := pbkdf2.Key(secret, salt, iterations, keyLength, sha512.New)
	return fmt.Sprintf("$pbkdf2-sha512$i=%d,l=%d$%s$%s", iterations, keyLength, base64.RawStdEncoding.EncodeToString(salt), base64.RawStdEncoding.EncodeToString(key)), nil
}

func generateRandomSalt(length int) ([]byte, error) {
	// Create a byte slice with the specified length
	salt := make([]byte, length)

	// Use crypto/rand to fill the slice with random bytes
	_, err := rand.Read(salt)
	if err != nil {
		return nil, err
	}

	// Return the salt as a hexadecimal string
	return salt, nil
}
